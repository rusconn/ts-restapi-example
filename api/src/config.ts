import process from "node:process";

import * as z from "zod";

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]),
    DATABASE_URL: z.string(),
  })
  .transform(({ NODE_ENV, DATABASE_URL }) => ({
    isDev: NODE_ENV === "development",
    isTest: NODE_ENV === "test",
    isProd: NODE_ENV === "production",
    connectionString: DATABASE_URL,
  }));

export const { isDev, isTest, isProd, connectionString } = envSchema.parse(process.env);
