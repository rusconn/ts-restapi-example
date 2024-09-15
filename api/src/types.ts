import type { AuthorAPI } from "./datasources/author.ts";
import type { AuthorBookAPI } from "./datasources/authorBook.ts";
import type { BookAPI } from "./datasources/book.ts";
import type { db } from "./db/client.ts";
import type { logger } from "./logger.ts";

export type Env = {
  Variables: {
    start: ReturnType<typeof Date.now>;
    logger: ReturnType<typeof logger.child>;
    api: {
      author: AuthorAPI;
      authorBook: AuthorBookAPI;
      book: BookAPI;
    };
    _db: typeof db;
  };
};
