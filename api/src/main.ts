import process from "node:process";

import { serve } from "@hono/node-server";

import app from "./app.ts";
import { cache } from "./cache/mod.ts";
import { db } from "./db/mod.ts";
import { logger } from "./logger.ts";

const server = serve(app, (info) => {
  console.log(`Listening on http://localhost:${info.port}`);
});

const shutdown = async () => {
  server.close();
  await db.destroy();
  await cache.disconnect();
  logger.flush();
};

// プラットフォームに合わせたシグナルハンドリングが必要
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

if (import.meta.hot) {
  import.meta.hot.on("vite:beforeFullReload", shutdown);
}
