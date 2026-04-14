CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(120) NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(80),
	"last_name" varchar(80),
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id")
);
