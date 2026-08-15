import { GameSession, GameType, StoryLieItem, UserProfile } from "./types";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Base URL for backend calls (fallback to localhost if env isn't set)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

const DEFAULT_TIMEOUT_MS = 10_000;
const RETRYABLE_METHODS = new Set(["GET", undefined]);

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

// Helper to strip any unexpected LaTeX math syntax into plain readable text
function cleanMathFormatting(text: string): string {
  return text
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 / $2");
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

async function apiFetch<T>(
  path: string,
  options?: RequestInit & { idempotent?: boolean; timeoutMs?: number }
): Promise<T> {
  const canRetry = RETRYABLE_METHODS.has(options?.method) || options?.idempotent;
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const { idempotent, timeoutMs: _, ...fetchOptions } = options ?? {};

  try {
    return await fetchOnce<T>(path, fetchOptions, timeoutMs);
  } catch (err) {
    const isClientError = err instanceof ApiError && err.status !== undefined && err.status < 500;
    if (!canRetry || isClientError) throw err;

    await sleep(500);
    return fetchOnce<T>(path, fetchOptions, timeoutMs);
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
      idempotent: true,
      timeoutMs: 30_000,
    }),

  // Direct client-side Gemini call
  askAi: async (query: string): Promise<AskAiResponse> => {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return {
        answer: "Gemini API key is missing. Add EXPO_PUBLIC_GEMINI_API_KEY to your .env.local file.",
        sources: [],
      };
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-3.6-flash",
        systemInstruction:
          "Format all mathematical equations using simple plain text (e.g., y = 4 / 2). Never use LaTeX formatting, dollar signs ($), or LaTeX commands like \\frac.",
      });
      const result = await model.generateContent(query);
      const rawText = result.response.text();
      const cleanedAnswer = cleanMathFormatting(rawText);

      return {
        answer: cleanedAnswer,
        sources: ["Google Gemini AI"],
      };
    } catch (error) {
      console.error("Gemini Direct Error:", error);
      throw new ApiError("Failed to reach Gemini AI service");
    }
  },
};