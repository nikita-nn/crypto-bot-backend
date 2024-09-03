import { db } from "@/data/settings.ts";
import { trackedAddresses } from "@/data/schema.ts";
import { and, eq } from "drizzle-orm";

export async function listAction(userId: number) {
  return db
    .select()
    .from(trackedAddresses)
    .where(eq(trackedAddresses.userId, userId));
}

export async function deleteAction(userId: number, wallet: string) {
  await db
    .delete(trackedAddresses)
    .where(
      and(
        eq(trackedAddresses.userId, userId),
        eq(trackedAddresses.walletAddress, wallet),
      ),
    );
}

export async function whalesAction(
  userId: number,
  category: "whales" | "influencers" | "developers",
  zerionLink1: string,
  name: string,
  wallet: string,
) {
  await db.insert(trackedAddresses).values({
    userId: userId,
    walletAddress: wallet,
    name: name,
    zerionLink1: zerionLink1,
    category: category,
  });
}

export async function influencersAction(
  userId: number,
  category: "whales" | "influencers" | "developers",
  zerionLink1: string,
  name: string,
  wallet: string,
  socialLink: string,
) {
  await db.insert(trackedAddresses).values({
    userId: userId,
    walletAddress: wallet,
    name: name,
    socialLink: socialLink,
    zerionLink1: zerionLink1,
    category: category,
  });
}

export async function developersAction(
  userId: number,
  category: "whales" | "influencers" | "developers",
  zerionLink1: string,
  zerionLink2: string,
  name: string,
  wallet: string,
  previousWallet1: string,
  previousWallet2: string,
  dexScreenerLink1: string,
  dexScreenerLink2: string,
  xQuantity1: string,
  xQuantity2: string,
  riskEntry: "high" | "medium" | "low",
) {
  await db.insert(trackedAddresses).values({
    userId: userId,
    walletAddress: wallet,
    name: name,
    category: category,
    zerionLink1: zerionLink1,
    zerionLink2: zerionLink2,
    previousWallet1: previousWallet1,
    previousWallet2: previousWallet2,
    dexScreenerLink1: dexScreenerLink1,
    dexScreenerLink2: dexScreenerLink2,
    xQuantity1: xQuantity1,
    xQuantity2: xQuantity2,
    riskEntry: riskEntry,
  });
}
