import type { db } from "../db/client.ts";
import type { AuthorSelect, BookInsert, BookSelect, BookUpdate } from "../db/models.ts";
import { fmap } from "../lib/functor.ts";
import type { Page, PageSize } from "../lib/pagination/schema.ts";
import * as s from "../lib/schema.ts";
import { createdAt, ulidDate } from "../lib/ulid.ts";

/** 列の順序を保証するために使う */
const allColumns = ["id", "updatedAt", "title"] as const;

export class BookAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  get(id: BookSelect["id"]) {
    return this.#db
      .selectFrom("Book")
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
    sortKey: "id" | "updatedAt" | "title";
    direction: "asc" | "desc";
    page: Page;
    pageSize: PageSize;
  }) {
    return this.#db
      .selectFrom("Book")
      .select(allColumns)
      .orderBy(sortKey, direction)
      .orderBy("id", direction)
      .limit(pageSize)
      .offset((page - 1) * pageSize)
      .execute()
      .then(fmap(createdAt));
  }

  getsByAuthorId(
    id: AuthorSelect["id"],
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
      .selectFrom("Book")
      .select(({ fn }) => fn.countAll().as("count"))
      .executeTakeFirstOrThrow()
      .then(({ count }) => s.nonNegativeInt.parse(count));
  }

  isExists(id: BookSelect["id"]) {
    return this.#db
      .selectFrom("Book")
      .where("id", "=", id)
      .select("id")
      .executeTakeFirst()
      .then(Boolean);
  }

  create(data: Omit<BookInsert, "id" | "updatedAt">) {
    const { id, date: updatedAt } = ulidDate();

    return this.#db
      .insertInto("Book")
      .values({ ...data, id, updatedAt })
      .returning(allColumns)
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));
  }

  update(id: BookSelect["id"], data: BookUpdate) {
    return this.#db
      .updateTable("Book")
      .where("id", "=", id)
      .set(data)
      .returning(allColumns)
      .executeTakeFirst()
      .then(fmap(createdAt));
  }

  delete(id: BookSelect["id"]) {
    return this.#db //
      .deleteFrom("Book")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();
  }
}
