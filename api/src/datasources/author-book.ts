import type { db } from "../db/client.ts";
import * as s from "../lib/schema.ts";

/** 列の順序を保証するために使う */
const allColumns = ["authorId", "bookId"] as const;

export class AuthorBookAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  countByBookId(id: s.BookId) {
    return this.#db
      .selectFrom("AuthorBook")
      .where("bookId", "=", id)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  countByAuthorId(id: s.AuthorId) {
    return this.#db
      .selectFrom("AuthorBook")
      .where("authorId", "=", id)
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  isExists(authorId: s.AuthorId, bookId: s.BookId) {
    return this.#db
      .selectFrom("AuthorBook")
      .where("authorId", "=", authorId)
      .where("bookId", "=", bookId)
      .select("authorId")
      .executeTakeFirst()
      .then(Boolean);
  }

  create(authorId: s.AuthorId, bookId: s.BookId) {
    return this.#db
      .insertInto("AuthorBook")
      .values({ authorId, bookId })
      .returning(allColumns)
      .executeTakeFirstOrThrow();
  }

  delete(authorId: s.AuthorId, bookId: s.BookId) {
    return this.#db
      .deleteFrom("AuthorBook")
      .where("authorId", "=", authorId)
      .where("bookId", "=", bookId)
      .returning(allColumns)
      .executeTakeFirst();
  }
}
