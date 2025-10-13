CREATE TYPE "public"."currency" AS ENUM('NGN', 'KES', 'USDC', 'USDT');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('paystack', 'system', 'manual');--> statement-breakpoint
CREATE TYPE "public"."tx_direction" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."tx_status" AS ENUM('pending', 'success', 'failed', 'reversed');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"amount" bigint NOT NULL,
	"currency" "currency" NOT NULL,
	"direction" "tx_direction" NOT NULL,
	"status" "tx_status" DEFAULT 'pending' NOT NULL,
	"provider" "provider" DEFAULT 'paystack' NOT NULL,
	"provider_ref" text,
	"description" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"address" text NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"kyc" boolean DEFAULT true NOT NULL,
	"ngn_balance" bigint DEFAULT 0 NOT NULL,
	"kes_balance" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_address_unique" UNIQUE("address"),
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_provider_ref_idx" ON "transactions" USING btree ("provider_ref");--> statement-breakpoint
CREATE INDEX "transactions_user_created_idx" ON "transactions" USING btree ("user_id","created_at");