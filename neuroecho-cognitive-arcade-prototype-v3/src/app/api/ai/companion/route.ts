import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const VALID_GAMES = ["spot-ai-lie", "era-guesser", "recipe-rebuilder", "motion-match"] as const;
const VALID_SCREENS = ["hub", "analytics", "settings"] as const;

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  hi: "Hindi (हिन्दी, in Devanagari script)",
};

function buildSystemInstruction(languageName: string) {
  return `You are Echo, a warm and patient AI companion inside the NeuroEcho app, built to help older adults who find app interfaces overwhelming. You are having a spoken conversation — the user just spoke to you, and their words were provided to you as audio.

The app has four cognitive games and three main screens:
Games: "spot-ai-lie" (Spot the AI Lie — a listening/memory game), "era-guesser" (Era Guesser — a visual history game), "recipe-rebuilder" (Recipe Rebuilder — a step-ordering game), "motion-match" (Motion Match — a hand-raising motor coordination game).
Screens: "hub" (home screen with all games), "analytics" (their cognitive progress report), "settings" (preferences).

Your job:
1. Listen to the audio and transcribe what the user said, in whatever language they actually spoke.
2. Reply the way a kind human companion would — short, warm, plain-spoken sentences, never robotic, never more than 3 sentences. Avoid jargon. Write your reply entirely in ${languageName}, regardless of what language the user spoke in.
3. Actively guide them: if they sound unsure or ask what they can do, offer 2-3 concrete spoken choices (e.g. "Would you like to play Spot the AI Lie, or check your progress report?") rather than making them figure out the interface.
4. If they clearly ask to open, play, or go to something, set an action to take them straight there instead of just describing it. Two of the games — "spot-ai-lie" and "motion-match" — can also be started immediately: if the user's words imply they want to jump straight into playing (e.g. "open Spot the AI Lie and start it", "let's play Motion Match now"), set action.startAfterNavigate to true so it begins automatically. Leave it false/omitted if they only asked to open or look at the game.
5. If they are just chatting or asking a question with no navigation intent, set action.type to "none" and just respond conversationally.

Always respond ONLY with the required JSON structure.`;
}

export async function POST(req: Request) {
  try {
    const { audioBase64, mimeType, history, language } = await req.json();

    if (!audioBase64 || typeof audioBase64 !== "string") {
      return NextResponse.json({ error: "audioBase64 is required" }, { status: 400 });
    }

    const languageName = LANGUAGE_NAMES[language] || LANGUAGE_NAMES.en;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          transcript: "",
          reply: "I can't reach my voice service right now — the app is missing its AI key. Please tell whoever set this up.",
          action: { type: "none" },
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const historyText = Array.isArray(history) && history.length > 0
      ? "Conversation so far:\n" +
        history
          .slice(-8)
          .map((turn: { role: string; text: string }) => `${turn.role === "user" ? "User" : "Echo"}: ${turn.text}`)
          .join("\n") +
        "\n\nNow respond to the new audio message below."
      : "This is the start of the conversation.";

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { data: audioBase64, mimeType: mimeType || "audio/m4a" } },
            { text: historyText },
          ],
        },
      ],
      config: {
        systemInstruction: buildSystemInstruction(languageName),
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          properties: {
            transcript: { type: "string", description: "What the user said, transcribed" },
            reply: { type: "string", description: "Echo's spoken reply, 1-3 short sentences" },
            action: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["navigate_game", "navigate_screen", "none"] },
                target: {
                  type: "string",
                  enum: [...VALID_GAMES, ...VALID_SCREENS],
                },
                startAfterNavigate: {
                  type: "boolean",
                  description: "Only meaningful for spot-ai-lie or motion-match: begin playing immediately after opening.",
                },
              },
              required: ["type"],
            },
          },
          required: ["transcript", "reply", "action"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(text);

    if (
      parsed.action?.type === "navigate_game" &&
      !VALID_GAMES.includes(parsed.action.target)
    ) {
      parsed.action = { type: "none" };
    }
    if (
      parsed.action?.type === "navigate_screen" &&
      !VALID_SCREENS.includes(parsed.action.target)
    ) {
      parsed.action = { type: "none" };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("AI companion error:", error);
    return NextResponse.json(
      {
        transcript: "",
        reply: "Sorry, I didn't quite catch that. Could you say it again?",
        action: { type: "none" },
      },
      { status: 200 }
    );
  }
}
