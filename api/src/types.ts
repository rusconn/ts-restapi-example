import type { AuthorAPI, AuthorBookAPI, BookAPI } from "./datasources/_mod.ts";
import type { db } from "./db/client.ts";

export type Env = {
  Variables: {
    start: ReturnType<typeof Date.now>;
    requestId: ReturnType<typeof crypto.randomUUID>;
    api: {
      author: AuthorAPI;
      authorBook: AuthorBookAPI;
      book: BookAPI;
    };
    _db: typeof db;
  };
};
