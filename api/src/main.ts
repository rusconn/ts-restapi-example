import process from "node:process";

import { serve } from "@hono/node-server";

import app from "./app.ts";
import { db } from "./db/client.ts";
import { logger } from "./logger.ts";

const server = serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const shutdown = async () => {
  server.close();
  await db.destroy();
  logger.flush();
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
