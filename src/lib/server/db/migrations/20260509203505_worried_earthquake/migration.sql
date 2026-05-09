CREATE TABLE "tournament_access" (
	"tournament_id" integer,
	"user_id" integer,
	CONSTRAINT "tournament_access_pkey" PRIMARY KEY("tournament_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "tournament_access" ADD CONSTRAINT "tournament_access_tournament_id_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id");--> statement-breakpoint
ALTER TABLE "tournament_access" ADD CONSTRAINT "tournament_access_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id");