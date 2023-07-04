CREATE TABLE IF NOT EXISTS "audios" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(32) NOT NULL,
	"description" varchar(264) DEFAULT NULL,
	"play_count" integer DEFAULT 0,
	"user_id" integer NOT NULL,
	"file_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "files" (
	"id" serial PRIMARY KEY NOT NULL,
	"file_name" varchar(264) NOT NULL,
	"mime" varchar(32) NOT NULL,
	"is_used" boolean DEFAULT false,
	"user_id" integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "file_id_idx" ON "audios" ("file_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "file_name_idx" ON "files" ("file_name");--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audios" ADD CONSTRAINT "audios_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "audios" ADD CONSTRAINT "audios_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "files" ADD CONSTRAINT "files_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
