import { defineConfig } from "drizzle-kit";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/data/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: "postgresql://neondb_owner:ZeS5WToLNp7C@ep-little-darkness-a2t57lhz.eu-central-1.aws.neon.tech/neondb?sslmode=require",
  },
});
