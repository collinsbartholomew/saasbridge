import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const rateLimits = pgTable(
  "rate_limits",
  {
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    key: text("key").notNull(),
  },
  (table) => ({
    keyCreatedAtIdx: index("rate_limits_key_created_at_idx").on(table.key, table.createdAt),
  }),
);
