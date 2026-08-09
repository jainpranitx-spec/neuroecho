CREATE TABLE "ai_generated_stories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"topic" text NOT NULL,
	"story_text" text NOT NULL,
	"false_detail" text NOT NULL,
	"false_sentence_index" integer NOT NULL,
	"corrected_fact" text NOT NULL,
	"explanation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cognitive_insights" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"memory_score" integer DEFAULT 85 NOT NULL,
	"sequencing_score" integer DEFAULT 90 NOT NULL,
	"visual_recognition_score" integer DEFAULT 88 NOT NULL,
	"motor_control_score" integer DEFAULT 82 NOT NULL,
	"ai_summary" text NOT NULL,
	"recommendation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid,
	"game_type" text NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"max_score" integer DEFAULT 100 NOT NULL,
	"accuracy_percentage" integer DEFAULT 100 NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"details" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text DEFAULT 'Senior Explorer' NOT NULL,
	"age" integer DEFAULT 72,
	"difficulty_level" text DEFAULT 'standard' NOT NULL,
	"speech_rate" text DEFAULT '0.9' NOT NULL,
	"tremor_assist" boolean DEFAULT true NOT NULL,
	"high_contrast" boolean DEFAULT false NOT NULL,
	"voice_feedback_enabled" boolean DEFAULT true NOT NULL,
	"cognitive_goals" jsonb DEFAULT '["Memory Audit","Motor Coordination","Sequencing"]'::jsonb,
	"streak_days" integer DEFAULT 3 NOT NULL,
	"total_xp" integer DEFAULT 420 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cognitive_insights" ADD CONSTRAINT "cognitive_insights_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;