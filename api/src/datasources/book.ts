import type { db } from "../db/client.ts";
import type { BookInsert, BookUpdate } from "../db/models.ts";
import { fmap } from "../lib/functor.ts";
import type { Page, PageSize } from "../lib/pagination/schema.ts";
import * as s from "../lib/schema.ts";
import { createdAt, uuidDate } from "../lib/uuid.ts";

export class BookAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  get(id: s.BookId) {
    return this.#db
      .selectFrom("Book")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst()
      .then(fmap(createdAt));
  }

  gets({
    sortKey,
    direction,
    page,
    pageSize,
  }: {
    sortKey: "id" | "updatedAt" | "title";
    direction: "asc" | "desc";
    page: Page;
    pageSize: PageSize;
  }) {
    return this.#db
      .selectFrom("Book")
      .selectAll()
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()
      .then(fmap(createdAt));
  }

  getsByAuthorId(
    id: s.AuthorId,
    {
      sortKey,
      direction,
      page,
      pageSize,
    }: {
      sortKey: "id" | "updatedAt" | "title";
      direction: "asc" | "desc";
      page: Page;
      pageSize: PageSize;
    },
  ) {
    return this.#db
      .selectFrom("Book")
      .innerJoin("AuthorBook", "id", "bookId")
      .where("authorId", "=", id)
      .selectAll()
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()
      .then(fmap(createdAt));
  }

  count() {
    return this.#db
      .selectFrom("Book")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  isExists(id: s.BookId) {
    return this.#db
      .selectFrom("Book")
      .where("id", "=", id)
      .select("id")
      .executeTakeFirst()
      .then(Boolean);
  }

  create(data: Omit<BookInsert, "id" | "updatedAt">) {
    const { id, date: updatedAt } = uuidDate();

    return this.#db
      .insertInto("Book")
      .values({ ...data, id, updatedAt })
      .returningAll()
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));
  }

  update(id: s.BookId, data: Omit<BookUpdate, "updatedAt">) {
    return this.#db
      .updateTable("Book")
      .where("id", "=", id)
      .set({ ...data, updatedAt: new Date() })
      .returningAll()
      .executeTakeFirst()
      .then(fmap(createdAt));
  }

  delete(id: s.BookId) {
    return this.#db //
      .deleteFrom("Book")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();
  }
}
