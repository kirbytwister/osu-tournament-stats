CREATE TYPE "qualifier_seeding_method" AS ENUM('average_score', 'sum_of_placements', 'percent_max', 'percent_diff', 'z_sum', 'z_percentile', 'zipfs_law');--> statement-breakpoint
CREATE TYPE "ruleset" AS ENUM('osu', 'taiko', 'fruits', 'mania');--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY,
	"user_id" integer NOT NULL,
	"secret_hash" text NOT NULL,
	"last_verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tournament" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "tournament_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"creator_user_id" integer NOT NULL,
	"name" varchar NOT NULL UNIQUE,
	"abbreviation" varchar,
	"ruleset" "ruleset",
	"players_per_team" integer,
	"playing_team_size" integer,
	"qualifier_seeding_method" "qualifier_seeding_method",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" text NOT NULL,
	"osu_id" integer NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_creator_user_id_user_id_fkey" FOREIGN KEY ("creator_user_id") REFERENCES "user"("id");