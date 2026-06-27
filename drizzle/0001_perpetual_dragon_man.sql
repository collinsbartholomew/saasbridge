CREATE TABLE "idempotency_keys" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"key" text PRIMARY KEY NOT NULL,
	"response" jsonb NOT NULL,
	"result_hash" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limits_key_created_at_idx" ON "rate_limits" USING btree ("key","created_at");