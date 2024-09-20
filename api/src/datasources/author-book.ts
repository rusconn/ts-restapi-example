import type { db } from "../db/client.ts";
import type { AuthorSelect, BookSelect } from "../db/models.ts";
import * as s from "../lib/schema.ts";

/** 列の順序を保証するために使う */
const allColumns = ["authorId", "bookId"] as const;

export class AuthorBookAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  countByBookId(id: BookSelect["id"]) {
    return this.#db
      .selectFrom("AuthorBook")
      .where("bookId", "=", id)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  countByAuthorId(id: AuthorSelect["id"]) {
    return this.#db
      .selectFrom("AuthorBook")
      .where("authorId", "=", id)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  isExists(authorId: AuthorSelect["id"], bookId: BookSelect["id"]) {
    return this.#db
      .selectFrom("AuthorBook")
      .where("authorId", "=", authorId)
      .where("bookId", "=", bookId)
      .select("authorId")
      .executeTakeFirst()
      .then(Boolean);
  }

  create(authorId: AuthorSelect["id"], bookId: BookSelect["id"]) {
    return this.#db
      .insertInto("AuthorBook")
      .values({ authorId, bookId })
      .returning(allColumns)
      .executeTakeFirstOrThrow();
  }

  delete(authorId: AuthorSelect["id"], bookId: BookSelect["id"]) {
    return this.#db
      .deleteFrom("AuthorBook")
      .where("authorId", "=", authorId)
      .where("bookId", "=", bookId)
      .returning(allColumns)
      .executeTakeFirst();
  }
}
