import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegramId", { mode: "bigint" }).notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const categoryEnum = pgEnum("categoryEnum", [
  "whales",
  "influencers",
  "developers",
]);
export const riskEnum = pgEnum("riskEnum", ["high", "medium", "low"]);

export const trackedAddresses = pgTable("tracked_addresses", {
  id: serial("id").primaryKey(),
  walletAddress: varchar("walletAddress", { length: 42 }).notNull().unique(),
  userId: integer("userId")
    .references(() => users.id)
    .notNull(),
  category: categoryEnum("category").notNull(),
  name: varchar("name").notNull(),
  socialLink: varchar("link"),
  zerionLink1: varchar("zerionLink1").notNull(),
  previousWallet1: varchar("previousWallet1"),
  zerionLink2: varchar("zerionLink2"),
  previousWallet2: varchar("previousWallet2"),
  dexScreenerLink1: varchar("dexScreenerLink1"),
  xQuantity1: varchar("xQuantity1"),
  dexScreenerLink2: varchar("dexScreenerLink2"),
  xQuantity2: varchar("xQuantity2"),
  riskEntry: riskEnum("riskEntry"),
});
