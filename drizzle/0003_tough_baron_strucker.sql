CREATE TABLE "profile_completion_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(120) NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"progress_percent" integer DEFAULT 25 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"form_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "profile_completion_progress_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
