CREATE TABLE "chat_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "match_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ranked_uni_ids" text[],
	"ranked_sch_ids" text[],
	"gemini_output" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "scholarships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"amount_usd" integer NOT NULL,
	"renewable" boolean DEFAULT false,
	"gpa_min" real NOT NULL,
	"eligible_countries" text[] NOT NULL,
	"degree_levels" text[] NOT NULL,
	"income_requirement" varchar(50) NOT NULL,
	"eligible_majors" text[] NOT NULL,
	"deadline" date,
	"award_type" varchar(50) NOT NULL,
	"application_url" varchar(512),
	"university_id" uuid,
	"description_text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"country" varchar(80) NOT NULL,
	"date_of_birth" date,
	"current_level" varchar(40) NOT NULL,
	"target_level" varchar(40) NOT NULL,
	"intended_major" varchar(100) NOT NULL,
	"gpa" real NOT NULL,
	"gpa_scale" real DEFAULT 4 NOT NULL,
	"annual_income_range" varchar(40) NOT NULL,
	"english_test" varchar(30),
	"english_score" real,
	"financial_aid_need" varchar(30) NOT NULL,
	"target_year" varchar(10) NOT NULL,
	"preferred_states" text[],
	"extracurriculars" text[],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"state" varchar(60) NOT NULL,
	"acceptance_rate" real NOT NULL,
	"min_gpa" real NOT NULL,
	"tuition_usd" integer NOT NULL,
	"financial_aid_avail" boolean DEFAULT false NOT NULL,
	"toefl_min" integer,
	"ielts_min" real,
	"supported_majors" text[] NOT NULL,
	"application_deadline" date,
	"rank_tier" varchar(30),
	"website_url" varchar(512),
	"description_text" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_results" ADD CONSTRAINT "match_results_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scholarships" ADD CONSTRAINT "scholarships_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "student_profiles" ADD CONSTRAINT "student_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;