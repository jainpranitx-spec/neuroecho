import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().default("Senior Explorer"),
  age: integer("age").default(72),
  difficultyLevel: text("difficulty_level").notNull().default("standard"), // 'gentle', 'standard', 'challenge'
  speechRate: text("speech_rate").notNull().default("0.9"), // '0.8', '0.9', '1.0'
  tremorAssist: boolean("tremor_assist").notNull().default(true),
  highContrast: boolean("high_contrast").notNull().default(false),
  voiceFeedbackEnabled: boolean("voice_feedback_enabled").notNull().default(true),
  cognitiveGoals: jsonb("cognitive_goals").$type<string[]>().default(["Memory Audit", "Motor Coordination", "Sequencing"]),
  streakDays: integer("streak_days").notNull().default(3),
  totalXp: integer("total_xp").notNull().default(420),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const gameSessions = pgTable("game_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  gameType: text("game_type").notNull(), // 'spot-ai-lie' | 'era-guesser' | 'recipe-rebuilder' | 'motion-match'
  score: integer("score").notNull().default(0),
  maxScore: integer("max_score").notNull().default(100),
  accuracyPercentage: integer("accuracy_percentage").notNull().default(100),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  details: jsonb("details").$type<{
    difficulty?: string;
    mistakesCount?: number;
    reactionTimeMs?: number;
    summary?: string;
    aiNotes?: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiGeneratedStories = pgTable("ai_generated_stories", {
  id: uuid("id").defaultRandom().primaryKey(),
  topic: text("topic").notNull(),
  storyText: text("story_text").notNull(),
  falseDetail: text("false_detail").notNull(),
  falseSentenceIndex: integer("false_sentence_index").notNull(),
  correctedFact: text("corrected_fact").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cognitiveInsights = pgTable("cognitive_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => userProfiles.id, { onDelete: "cascade" }),
  memoryScore: integer("memory_score").notNull().default(85),
  sequencingScore: integer("sequencing_score").notNull().default(90),
  visualRecognitionScore: integer("visual_recognition_score").notNull().default(88),
  motorControlScore: integer("motor_control_score").notNull().default(82),
  aiSummary: text("ai_summary").notNull(),
  recommendation: text("recommendation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// A simple two-way feedback thread. deviceId is a random id the app
// generates once and stores locally (AsyncStorage) — not a real user
// account, just enough to group one device's messages together and let a
// developer's reply (direction: 'dev_to_user', inserted directly via the
// database) show back up for that same device.
export const feedbackMessages = pgTable("feedback_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  deviceId: text("device_id").notNull(),
  direction: text("direction").notNull(), // 'user_to_dev' | 'dev_to_user'
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
