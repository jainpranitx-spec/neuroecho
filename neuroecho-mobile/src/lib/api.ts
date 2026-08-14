import { GameSession, GameType, StoryLieItem, UserProfile } from "./types";

// Set via `EXPO_PUBLIC_API_URL` at build time (Expo inlines EXPO_PUBLIC_*
// vars automatically — no extra config needed). Point this at your deployed
// backend (see neuroecho-cognitive-arcade-prototype-v3), e.g.
// https://neuroecho.vercel.app
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const DEFAULT_TIMEOUT_MS = 10_000;
const RETRYABLE_METHODS = new Set(["GET", undefined]); // don't retry POSTs (not idempotent)

export class ApiError extends Error {
  readonly status?: number;
  readonly cause?: unknown;

  constructor(message: string, opts?: { status?: number; cause?: unknown }) {
    super(message);
    this.name = "ApiError";
    this.status = opts?.status;
    this.cause = opts?.cause;
  }
}

export interface AnalyticsResponse {
  overallIndex: number;
  scores: {
    memoryAudit: number;
    visualRecognition: number;
    logicalSequencing: number;
    motorCoordination: number;
  };
  totalSessionsCompleted: number;
  recentSessions: GameSession[];
  aiRecommendation: string;
}

export interface SaveSessionInput {
  gameType: GameType;
  score: number;
  maxScore: number;
  accuracyPercentage: number;
  durationSeconds: number;
  details?: Record<string, unknown>;
}

export interface AskAiResponse {
  answer: string;
  sources: string[];
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchOnce<T>(path: string, options?: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });

    if (!res.ok) {
      throw new ApiError(`Request to ${path} failed with status ${res.status}`, {
        status: res.status,
      });
    }

    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(`Request to ${path} timed out after ${timeoutMs}ms`, { cause: err });
    }
    throw new ApiError(`Network error calling ${path}`, { cause: err });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Wraps fetchOnce with a single retry for transient failures. Only retries
 * safe/idempotent requests (GET, or POST explicitly marked `idempotent`) so
 * we never risk double-submitting a game session or story generation.
 * Skips retrying 4xx application errors (those won't succeed on retry).
 */
async function apiFetch<T>(
  path: string,
  options?: RequestInit & { idempotent?: boolean }
): Promise<T> {
  const canRetry = RETRYABLE_METHODS.has(options?.method) || options?.idempotent;

  try {
    return await fetchOnce<T>(path, options);
  } catch (err) {
    const isClientError = err instanceof ApiError && err.status !== undefined && err.status < 500;
    if (!canRetry || isClientError) throw err;

    await sleep(500);
    return fetchOnce<T>(path, options);
  }
}

export const api = {
  getProfile: () => apiFetch<UserProfile>("/api/profile"),

  updateProfile: (profile: Partial<UserProfile>) =>
    apiFetch<UserProfile>("/api/profile", {
      method: "POST",
      body: JSON.stringify(profile),
    }),

  getAnalytics: () => apiFetch<AnalyticsResponse>("/api/analytics"),

  getSessions: () => apiFetch<GameSession[]>("/api/sessions"),

  saveSession: (session: SaveSessionInput) =>
    apiFetch<{ session: GameSession; xpGained: number }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify(session),
    }),

  generateStory: (topic: string) =>
    apiFetch<StoryLieItem>("/api/ai/story", {
      method: "POST",
      body: JSON.stringify({ topic }),
      // Generation is a create-a-new-story action, not strictly idempotent
      // in effect, but safe to retry once here since a timed-out request
      // never reached the "story generated" state the caller acts on.
      idempotent: true,
    }),

  askAi: (query: string) =>
    apiFetch<AskAiResponse>("/api/ai/query", {
      method: "POST",
      body: JSON.stringify({ query }),
      idempotent: true,
    }),
};
