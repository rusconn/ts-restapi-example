import type { db } from "../db/client.ts";
import type { AuthorInsert, AuthorUpdate } from "../db/models.ts";
import { fmap } from "../lib/functor.ts";
import type { Page, PageSize } from "../lib/pagination/schema.ts";
import * as s from "../lib/schema.ts";
import { createdAt, uuidDate } from "../lib/uuid.ts";

/** 列の順序を保証するために使う */
const allColumns = ["id", "updatedAt", "name"] as const;

export class AuthorAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  get(id: s.AuthorId) {
    return this.#db
      .selectFrom("Author")
      .where("id", "=", id)
      .select(allColumns)
      .executeTakeFirst()
      .then(fmap(createdAt));
  }

  gets({
    sortKey,
    direction,
    page,
    pageSize,
  }: {
    sortKey: "id" | "updatedAt" | "name";
    direction: "asc" | "desc";
    page: Page;
    pageSize: PageSize;
  }) {
    return this.#db
      .selectFrom("Author")
      .select(allColumns)
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()
      .then(fmap(createdAt));
  }

  getsByBookId(
    id: s.BookId,
    {
      sortKey,
      direction,
      page,
      pageSize,
    }: {
      sortKey: "id" | "updatedAt" | "name";
      direction: "asc" | "desc";
      page: Page;
      pageSize: PageSize;
    },
  ) {
    return this.#db
      .selectFrom("Author")
      .innerJoin("AuthorBook", "id", "authorId")
      .where("bookId", "=", id)
      .select(allColumns)
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()
      .then(fmap(createdAt));
  }

  count() {
    return this.#db
      .selectFrom("Author")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  isExists(id: s.AuthorId) {
    return this.#db
      .selectFrom("Author")
      .where("id", "=", id)
      .select("id")
      .executeTakeFirst()
      .then(Boolean);
  }

  create(data: Omit<AuthorInsert, "id" | "updatedAt">) {
    const { id, date: updatedAt } = uuidDate();

    return this.#db
      .insertInto("Author")
      .values({ ...data, id, updatedAt })
      .returning(allColumns)
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));
  }

  update(id: s.AuthorId, data: Omit<AuthorUpdate, "updatedAt">) {
    return this.#db
      .updateTable("Author")
      .where("id", "=", id)
      .set({ ...data, updatedAt: new Date() })
      .returning(allColumns)
      .executeTakeFirst()
      .then(fmap(createdAt));
  }

  delete(id: s.AuthorId) {
    return this.#db //
      .deleteFrom("Author")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();
  }
}
