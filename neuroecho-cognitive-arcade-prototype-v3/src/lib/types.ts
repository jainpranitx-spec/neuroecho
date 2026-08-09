export type GameType = 'spot-ai-lie' | 'era-guesser' | 'recipe-rebuilder' | 'motion-match';

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  difficultyLevel: 'gentle' | 'standard' | 'challenge';
  speechRate: string;
  tremorAssist: boolean;
  highContrast: boolean;
  voiceFeedbackEnabled: boolean;
  cognitiveGoals: string[];
  streakDays: number;
  totalXp: number;
}

export interface GameSession {
  id: string;
  profileId: string;
  gameType: GameType;
  score: number;
  maxScore: number;
  accuracyPercentage: number;
  durationSeconds: number;
  details?: {
    difficulty?: string;
    mistakesCount?: number;
    reactionTimeMs?: number;
    summary?: string;
    aiNotes?: string;
  };
  createdAt: string;
}

export interface StoryLieItem {
  id: string;
  title: string;
  topic: string;
  decade?: string;
  sentences: string[];
  lieSentenceIndex: number;
  lieKeyword: string;
  correctedKeyword: string;
  explanation: string;
  funFact: string;
}

export interface EraGuesserItem {
  id: string;
  title: string;
  trueDecade: string;
  anachronismItem: string;
  correctExplanation: string;
  options: { label: string; isCorrect: boolean; detail: string }[];
  imageType: 'diner_bluetooth' | 'victorian_smartphone' | 'disco_smartwatch' | 'medieval_wristwatch' | 'arcade_tablet';
  visualDescription: string;
}

export interface RecipeItem {
  id: string;
  title: string;
  category: string;
  estimatedTime: string;
  scrambledSteps: { id: string; text: string; correctIndex: number; tip?: string }[];
}

export interface MotionTarget {
  id: string;
  label: string;
  emoji: string;
  category: 'fruit' | 'machine';
  requiredAction: 'left' | 'right'; // Left = Fruit, Right = Machine
}
