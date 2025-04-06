DO $$ BEGIN
 CREATE TYPE "public"."expense_type" AS ENUM('GROCERIES', 'TRANSPORTATION', 'ELECTRONICS', 'BILLS', 'FURNITURE', 'RESTAURANT');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_status" AS ENUM('pending', 'waiting_for_capture', 'succeeded', 'canceled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription" AS ENUM('start', 'basic', 'pro');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."user_role" AS ENUM('ADMIN', 'USER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "project_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_expenses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"amount" integer NOT NULL,
	"price" integer NOT NULL,
	"receipt_id" varchar(255) NOT NULL,
	"expense_type" "expense_type" NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_files" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"file_name" varchar(255) NOT NULL,
	"file_size" integer NOT NULL,
	"content_type" varchar(255) NOT NULL,
	"object_id" varchar(255) NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
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
CREATE TABLE IF NOT EXISTS "project_receipts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"file_id" varchar(255) NOT NULL,
	"is_saved" boolean DEFAULT false NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"current_subscription" "subscription" DEFAULT 'start' NOT NULL,
	"subscription_ends_at" timestamp with time zone DEFAULT now() NOT NULL,
	"image" varchar(255),
	"role" "user_role" DEFAULT 'USER'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "project_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_account" ADD CONSTRAINT "project_account_user_id_project_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."project_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_receipt_id_project_receipts_id_fk" FOREIGN KEY ("receipt_id") REFERENCES "public"."project_receipts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_expenses" ADD CONSTRAINT "project_expenses_created_by_project_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."project_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_payments" ADD CONSTRAINT "project_payments_user_id_project_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."project_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_receipts" ADD CONSTRAINT "project_receipts_file_id_project_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."project_files"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_receipts" ADD CONSTRAINT "project_receipts_created_by_project_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."project_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project_session" ADD CONSTRAINT "project_session_user_id_project_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."project_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "project_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "project_session" USING btree ("user_id");