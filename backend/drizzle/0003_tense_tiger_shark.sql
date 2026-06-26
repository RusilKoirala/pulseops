ALTER TABLE "monitors" ADD COLUMN IF NOT EXISTS "user_id" text;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN IF NOT EXISTS "notifications_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_token_expiry" timestamp;--> statement-breakpoint
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'monitors_user_id_users_id_fk'
  ) THEN
    ALTER TABLE "monitors" ADD CONSTRAINT "monitors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  END IF;
END $$;
