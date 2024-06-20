import { createClient } from "redis";

import { cacheUrl } from "../config.ts";
import { randInt } from "../lib/random.ts";
import { logger } from "../logger.ts";

export const cache = await createClient({
  url: cacheUrl,
  disableOfflineQueue: true,
  socket: {
    reconnectStrategy: (retries) => {
      return 100 + 2 ** retries + randInt(-50, 50);
    },
  },
})
  .on("error", (err: Error) => logger.error(err, "cache-error"))
  .connect();
