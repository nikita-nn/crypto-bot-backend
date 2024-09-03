import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import process from "node:process";
import { Network } from "alchemy-sdk";
import "dotenv/config";

const sql = neon(process.env.DRIZZLE_DATABASE_URL!);
export const db = drizzle(sql);

export const ALCHEMY_SETTINGS = {
  apiKey: process.env.ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};
