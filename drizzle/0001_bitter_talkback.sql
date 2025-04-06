DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'waiting_for_capture', 'succeeded', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_payments" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"idempotency_key" varchar(255) NOT NULL,
	"yookassa_id" varchar(255) NOT NULL,
	"confirmation_url" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"income_amount" integer,
	"status" "payment_status" DEFAULT 'pending' NOT NULL,
	"paid" boolean DEFAULT false NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"subscription" "subscription" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_payments_idempotency_key_unique" UNIQUE("idempotency_key"),
	CONSTRAINT "project_payments_yookassa_id_unique" UNIQUE("yookassa_id")
);
--> statement-breakpoint
ALTER TABLE "project_user" ADD COLUMN "current_subscription" "subscription" DEFAULT 'start' NOT NULL;--> statement-breakpoint
ALTER TABLE "project_user" ADD COLUMN "subscription_ends_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_user_id_project_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."project_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
