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
  },
  {
    "id": "2da90fcd-5684-483f-af95-b16f9725c35e",
    "title": "Gentle Mind Refresh",
    "description": "A relaxing trivia test designed to exercise your memory and stimulate your mind.",
    "kind": "quiz",
    "accent": "teal",
    "instructions": [
      "Read each question at your own pace.",
      "Select the answer you feel is correct.",
      "Enjoy a calm and pressure-free experience."
    ],
    "rounds": [
      {
        "prompt": "Which season comes right after Spring?",
        "choices": [
          {
            "label": "Summer",
            "isCorrect": true
          },
          {
            "label": "Winter",
            "isCorrect": false
          },
          {
            "label": "Autumn",
            "isCorrect": false
          }
        ],
        "successMessage": "Wonderful! Summer follows Spring with warmth and sunshine."
      },
      {
        "prompt": "What do bees collect from flowers to make honey?",
        "choices": [
          {
            "label": "Rainwater",
            "isCorrect": false
          },
          {
            "label": "Nectar",
            "isCorrect": true
          },
          {
            "label": "Pebbles",
            "isCorrect": false
          }
        ],
        "successMessage": "Correct! Bees collect sweet nectar from blossoms."
      },
      {
        "prompt": "Which of these is a warm and comforting beverage?",
        "choices": [
          {
            "label": "Ice water",
            "isCorrect": false
          },
          {
            "label": "Chamomile tea",
            "isCorrect": true
          },
          {
            "label": "Lemonade",
            "isCorrect": false
          }
        ],
        "successMessage": "Spot on! Chamomile tea is known for its calming warmth."
      }
    ]
  }
];

export function getGeneratedGame(id: string) {
  return GENERATED_GAMES.find((game) => game.id === id);
}
