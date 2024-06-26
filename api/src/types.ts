import type { cache } from "./cache/mod.ts";
import type { db } from "./db/client.ts";

export type Env = {
  Variables: {
    start: ReturnType<typeof Date.now>;
    requestId: ReturnType<typeof crypto.randomUUID>;
    cache: typeof cache;
    db: typeof db;
  };
};
