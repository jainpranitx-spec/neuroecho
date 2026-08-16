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
export const GENERATED_GAMES: GeneratedGameDefinition[] = [
  {
    "id": "483b5c45-8efd-4657-9adb-1f40cbb5dfdd",
    "title": "Hindi Song Antakshari",
    "description": "A gentle musical memory challenge inspired by traditional Antakshari.",
    "kind": "challenge",
    "accent": "amber",
    "instructions": [
      "Read the given starting letter for each round.",
      "Sing or hum a Hindi song beginning with that letter.",
      "Take your time and enjoy recalling fond musical memories."
    ],
    "rounds": [
      {
        "prompt": "Starting letter: 'M' (म)",
        "instruction": "Sing or hum any Hindi song starting with 'M', such as 'Mera Joota Hai Japani'.",
        "successMessage": "Wonderful! 'M' brings back so many unforgettable Hindi classics."
      },
      {
        "prompt": "Starting letter: 'P' (प)",
        "instruction": "Sing a line starting with 'P', such as 'Pyaar Hua Ikraar Hua'.",
        "successMessage": "Lovely melody! 'P' has given us endless poetic songs."
      },
      {
        "prompt": "Starting letter: 'K' (क)",
        "instruction": "Sing a line starting with 'K', such as 'Kabhi Kabhie Mere Dil Mein'.",
        "successMessage": "Beautifully done! 'K' is filled with iconic melodies."
      },
      {
        "prompt": "Starting letter: 'R' (र)",
        "instruction": "Sing a line starting with 'R', such as 'Rimjhim Gire Sawan'.",
        "successMessage": "Splendid finish! Music is a wonderful journey through time."
      }
    ]
  }
];

export function getGeneratedGame(id: string) {
  return GENERATED_GAMES.find((game) => game.id === id);
}
