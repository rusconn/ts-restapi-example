import type { AuthorAPI } from "./datasources/author.ts";
import type { AuthorBookAPI } from "./datasources/authorBook.ts";
import type { BookAPI } from "./datasources/book.ts";
import type { db } from "./db/client.ts";

export type Env = {
  Variables: {
    start: ReturnType<typeof Date.now>;
    api: {
      author: AuthorAPI;
      authorBook: AuthorBookAPI;
      book: BookAPI;
    };
    _db: typeof db;
  };
};
