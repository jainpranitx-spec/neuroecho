export type GeneratedGameKind = "quiz" | "challenge";

export interface GeneratedGameChoice {
  label: string;
  isCorrect: boolean;
}

export interface GeneratedGameRound {
  prompt: string;
  instruction?: string;
  choices?: GeneratedGameChoice[];
  successMessage: string;
}

export interface GeneratedGameDefinition {
  id: string;
  title: string;
  description: string;
  kind: GeneratedGameKind;
  accent: "teal" | "blue" | "amber" | "emerald";
  instructions: string[];
  rounds: GeneratedGameRound[];
}

// This manifest is updated by scripts/generate-game.mjs in a reviewed GitHub
// Actions pull request. Games remain declarative data: generated source can
// never execute arbitrary code on a user's phone.
export const GENERATED_GAMES: GeneratedGameDefinition[] = [];

export function getGeneratedGame(id: string) {
  return GENERATED_GAMES.find((game) => game.id === id);
}
