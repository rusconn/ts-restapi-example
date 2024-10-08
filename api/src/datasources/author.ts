import type { db } from "../db/client.ts";
import type { AuthorInsert, AuthorSelect, AuthorUpdate, BookSelect } from "../db/models.ts";
import { fmap } from "../lib/functor.ts";
import type { Page, PageSize } from "../lib/pagination/schema.ts";
import * as s from "../lib/schema.ts";
import { createdAt, ulidDate } from "../lib/ulid.ts";

/** 列の順序を保証するために使う */
const allColumns = ["id", "updatedAt", "name"] as const;

export class AuthorAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  get(id: AuthorSelect["id"]) {
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
    id: BookSelect["id"],
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

  isExists(id: AuthorSelect["id"]) {
    return this.#db
      .selectFrom("Author")
      .where("id", "=", id)
      .select("id")
      .executeTakeFirst()
      .then(Boolean);
  }

  create(data: Omit<AuthorInsert, "id" | "updatedAt">) {
    const { id, date: updatedAt } = ulidDate();

    return this.#db
      .insertInto("Author")
      .values({ ...data, id, updatedAt })
      .returning(allColumns)
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));
  }

  update(id: AuthorSelect["id"], data: AuthorUpdate) {
    return this.#db
      .updateTable("Author")
      .where("id", "=", id)
      .set(data)
      .returning(allColumns)
      .executeTakeFirst()
      .then(fmap(createdAt));
  }

  delete(id: AuthorSelect["id"]) {
    return this.#db //
      .deleteFrom("Author")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();
  }
}
