import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

const MAX_REQUESTS_PER_HOUR = 3;
const requestLog = new Map<string, number[]>();

function isRateLimited(key: string) {
  const now = Date.now();
  const recent = (requestLog.get(key) ?? []).filter((time) => now - time < 60 * 60 * 1000);
  if (recent.length >= MAX_REQUESTS_PER_HOUR) return true;
  requestLog.set(key, [...recent, now]);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many game requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = typeof body === "object" && body !== null && "prompt" in body
    ? String((body as { prompt: unknown }).prompt).trim()
    : "";

  if (prompt.length < 3 || prompt.length > 300) {
    return NextResponse.json({ error: "Game description must be between 3 and 300 characters." }, { status: 400 });
  }

  const token = process.env.GAME_GENERATOR_GITHUB_TOKEN;
  const repository = process.env.GAME_GENERATOR_REPOSITORY || "jainpranitx-spec/neuroecho";
  if (!token) {
    console.error("[game request] GAME_GENERATOR_GITHUB_TOKEN is not configured");
    return NextResponse.json({ error: "Game generation is not configured." }, { status: 503 });
  }

  const id = randomUUID();
  const response = await fetch(`https://api.github.com/repos/${repository}/dispatches`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event_type: "game_requested",
      client_payload: { id, prompt },
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[game request] GitHub dispatch failed (${response.status}): ${detail}`);
    return NextResponse.json({ error: "Could not queue the game request." }, { status: 502 });
  }

  return NextResponse.json({ id, status: "queued" as const }, { status: 202 });
}
