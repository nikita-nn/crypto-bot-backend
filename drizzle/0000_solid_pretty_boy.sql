DO $$ BEGIN
 CREATE TYPE "public"."categoryEnum" AS ENUM('whales', 'influencers', 'developers');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."riskEnum" AS ENUM('high', 'medium', 'low');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tracked_addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"walletAddress" varchar(42) NOT NULL,
	"userId" integer NOT NULL,
	"category" "categoryEnum" NOT NULL,
	"name" varchar NOT NULL,
	"link" varchar,
	"zerionLink1" varchar NOT NULL,
	"previousWallet1" varchar,
	"zerionLink2" varchar,
	"previousWallet2" varchar,
	"dexScreenerLink1" varchar,
	"xQuantity1" varchar,
	"dexScreenerLink2" varchar,
	"xQuantity2" varchar,
	"riskEntry" "riskEnum",
	CONSTRAINT "tracked_addresses_walletAddress_unique" UNIQUE("walletAddress")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"telegramId" bigint NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_telegramId_unique" UNIQUE("telegramId")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tracked_addresses" ADD CONSTRAINT "tracked_addresses_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
