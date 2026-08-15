import { GoogleGenerativeAI } from "@google/generative-ai";
import { GameSession, GameType, StoryLieItem, UserProfile } from "./types";
import { AppLanguage } from "./i18n";

const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: "English",
  hi: "Hindi (हिन्दी, in Devanagari script)",
};

// Strips LaTeX-style math markup Gemini sometimes emits, so answers render
// as plain readable text instead of raw $...$ / \frac{}{} syntax.
function cleanMathFormatting(text: string): string {
  return text
    .replace(/\$\$(.*?)\$\$/g, "$1")
    .replace(/\$(.*?)\$/g, "$1")
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "$1 / $2");
}

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

export interface CompanionTurn {
  role: "user" | "assistant";
  text: string;
}

export interface CompanionAction {
  type: "navigate_game" | "navigate_screen" | "none";
  target?: string;
  startAfterNavigate?: boolean;
}

export interface CompanionResponse {
  transcript: string;
  reply: string;
  action: CompanionAction;
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

  // Direct client-side Gemini call (by request) — the key ships inside the
  // app bundle via EXPO_PUBLIC_GEMINI_API_KEY, unlike askCompanion below
  // which stays server-side.
  askAi: async (query: string, language: AppLanguage = "en"): Promise<AskAiResponse> => {
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
        systemInstruction: `You are NeuroEcho AI, a warm, clear, encouraging cognitive assistant for older adults. Keep responses concise, high-contrast, easy to read, with 2-3 clear key bullet points and a warm encouraging closing tone. Format all mathematical equations using simple plain text (e.g., y = 4 / 2). Never use LaTeX formatting, dollar signs ($), or LaTeX commands like \\frac. Respond entirely in ${LANGUAGE_NAMES[language]}, regardless of what language the question was asked in.`,
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

  askCompanion: (audioBase64: string, mimeType: string, history: CompanionTurn[], language: AppLanguage = "en") =>
    apiFetch<CompanionResponse>("/api/ai/companion", {
      method: "POST",
      body: JSON.stringify({ audioBase64, mimeType, history, language }),
      timeoutMs: 30_000,
    }),
};