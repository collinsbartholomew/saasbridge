import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const idempotencyKeys = pgTable("idempotency_keys", {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  key: text("key").primaryKey(),
  response: jsonb("response").$type<unknown>().notNull(),
  resultHash: text("result_hash").notNull(),
  status: text("status").notNull(),
});
