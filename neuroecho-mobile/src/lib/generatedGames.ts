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
    "id": "6587ff35-7d1f-4787-b876-c21af4a2af90",
    "title": "Chess Basics & Setup",
    "description": "Test your knowledge of chess pieces, board layout, and basic setup rules.",
    "kind": "quiz",
    "accent": "teal",
    "instructions": [
      "Read each question about chess pieces and board setup.",
      "Select the correct answer from the options given.",
      "Take your time to enjoy exploring classic chess rules."
    ],
    "rounds": [
      {
        "prompt": "Which piece is placed in the very corners of the chess board at the start?",
        "choices": [
          {
            "label": "Rook",
            "isCorrect": true
          },
          {
            "label": "Knight",
            "isCorrect": false
          },
          {
            "label": "Bishop",
            "isCorrect": false
          },
          {
            "label": "Pawn",
            "isCorrect": false
          }
        ],
        "successMessage": "Correct! Rooks start in the four corners of the chess board."
      },
      {
        "prompt": "When placing pieces, which square should the White Queen be placed on?",
        "choices": [
          {
            "label": "A dark square",
            "isCorrect": false
          },
          {
            "label": "A light (white) square",
            "isCorrect": true
          },
          {
            "label": "Any corner square",
            "isCorrect": false
          },
          {
            "label": "In front of the King",
            "isCorrect": false
          }
        ],
        "successMessage": "Spot on! The rule is 'Queen on her own color', so White Queen goes on a light square."
      },
      {
        "prompt": "How does the Knight move on the chess board?",
        "choices": [
          {
            "label": "Only diagonally",
            "isCorrect": false
          },
          {
            "label": "In an 'L' shape",
            "isCorrect": true
          },
          {
            "label": "Straight ahead only",
            "isCorrect": false
          },
          {
            "label": "Three squares sideways",
            "isCorrect": false
          }
        ],
        "successMessage": "Well done! Knights move in an L-shape and are the only pieces that can jump over others."
      },
      {
        "prompt": "How many Pawns does each player have at the start of a game?",
        "choices": [
          {
            "label": "6 Pawns",
            "isCorrect": false
          },
          {
            "label": "8 Pawns",
            "isCorrect": true
          },
          {
            "label": "10 Pawns",
            "isCorrect": false
          },
          {
            "label": "12 Pawns",
            "isCorrect": false
          }
        ],
        "successMessage": "Exactly! Each player starts with 8 Pawns lining the front row."
      }
    ]
  },
  {
    "id": "dbe3ad0c-ee0e-43e3-9c71-dfc9ab9c6517",
    "title": "Building the Chessboard",
    "description": "A relaxing quiz about setting up and identifying chess pieces.",
    "kind": "quiz",
    "accent": "teal",
    "instructions": [
      "Read each question carefully.",
      "Select the correct answer to complete your chessboard setup."
    ],
    "rounds": [
      {
        "prompt": "When setting up a chessboard, which square color should be at your bottom-right corner?",
        "choices": [
          {
            "label": "Light square",
            "isCorrect": true
          },
          {
            "label": "Dark square",
            "isCorrect": false
          },
          {
            "label": "Any square",
            "isCorrect": false
          }
        ],
        "successMessage": "Correct! A light square is always on your right corner."
      },
      {
        "prompt": "On which square does the Queen always start?",
        "choices": [
          {
            "label": "On her matching color square",
            "isCorrect": true
          },
          {
            "label": "On the opposing color square",
            "isCorrect": false
          },
          {
            "label": "On any central square",
            "isCorrect": false
          }
        ],
        "successMessage": "Wonderful! The Queen always starts on a square matching her color."
      },
      {
        "prompt": "How many pawns does each player place on the second row?",
        "choices": [
          {
            "label": "6 pawns",
            "isCorrect": false
          },
          {
            "label": "8 pawns",
            "isCorrect": true
          },
          {
            "label": "10 pawns",
            "isCorrect": false
          }
        ],
        "successMessage": "Great job! Each player starts with 8 pawns forming the front line."
      },
      {
        "prompt": "Which pieces stand directly next to the King and Queen?",
        "choices": [
          {
            "label": "Knights",
            "isCorrect": false
          },
          {
            "label": "Rooks",
            "isCorrect": false
          },
          {
            "label": "Bishops",
            "isCorrect": true
          }
        ],
        "successMessage": "Excellently answered! The two Bishops flank the King and Queen."
      }
    ]
  },
  {
    "id": "eb1461a3-6d5f-4fb3-992e-2632f77e123c",
    "title": "Carrom Board Tactics",
    "description": "Test your knowledge of Carrom rules, striking techniques, and board angles in this relaxing game.",
    "kind": "quiz",
    "accent": "amber",
    "instructions": [
      "Read each Carrom situation carefully.",
      "Select the best shot, rule, or technique to score points.",
      "Take your time and enjoy playing at your own pace."
    ],
    "rounds": [
      {
        "prompt": "Which piece on the Carrom board is worth the highest points and requires a cover?",
        "choices": [
          {
            "label": "The Red Queen",
            "isCorrect": true
          },
          {
            "label": "The White Piece",
            "isCorrect": false
          },
          {
            "label": "The Black Piece",
            "isCorrect": false
          },
          {
            "label": "The Striker",
            "isCorrect": false
          }
        ],
        "successMessage": "Correct! The Queen is worth the most points and must be covered by pocketing another piece on the next shot."
      },
      {
        "prompt": "If you pocket the Queen, what must you do on your next shot to claim her?",
        "choices": [
          {
            "label": "Pocket any of your carrom men as a cover",
            "isCorrect": true
          },
          {
            "label": "Pocket the striker into a corner",
            "isCorrect": false
          },
          {
            "label": "Pass your turn to the opponent",
            "isCorrect": false
          },
          {
            "label": "Flick the opponent's piece",
            "isCorrect": false
          }
        ],
        "successMessage": "Right! Pocketing a cover piece confirms your claim on the Queen."
      },
      {
        "prompt": "What happens if you accidentally pocket the Striker during your turn?",
        "choices": [
          {
            "label": "It is a foul, and you pay a penalty piece",
            "isCorrect": true
          },
          {
            "label": "You automatically win the board",
            "isCorrect": false
          },
          {
            "label": "You get two extra free turns",
            "isCorrect": false
          },
          {
            "label": "The game restarts immediately",
            "isCorrect": false
          }
        ],
        "successMessage": "Spot on! Pocketing the striker is a foul, incurring a penalty piece."
      },
      {
        "prompt": "Which shot angle uses the wooden side frame to bounce the striker towards a hidden piece?",
        "choices": [
          {
            "label": "Bank Shot",
            "isCorrect": true
          },
          {
            "label": "Direct Cut Shot",
            "isCorrect": false
          },
          {
            "label": "Center Break",
            "isCorrect": false
          },
          {
            "label": "Straight Push",
            "isCorrect": false
          }
        ],
        "successMessage": "Well done! A bank shot uses the frame rebound to hit hard-to-reach pieces."
      }
    ]
  }
];

export function getGeneratedGame(id: string) {
  return GENERATED_GAMES.find((game) => game.id === id);
}
