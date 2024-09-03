import {
  bigint,
  integer,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegramId", { mode: "bigint" }).notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const trackedAddresses = pgTable("tracked_addresses", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("walletAddress", { length: 42 }).notNull().unique(),
  userId: integer("userId")
    .references(() => users.id)
    .notNull(),
});
