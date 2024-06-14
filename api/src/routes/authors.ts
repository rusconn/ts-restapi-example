import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { fmap } from "../lib/functor.ts";
import { linkEntries } from "../lib/pagination/header.ts";
import * as p from "../lib/pagination/schema.ts";
import * as s from "../lib/schema.ts";
import { createdAt, ulidDate } from "../lib/ulid.ts";
import type { Env } from "../types.ts";

const PAGE_MAX = s.positiveInt.parse(100);
const PAGE_SIZE_MIN = s.positiveInt.parse(1);
const PAGE_SIZE_MAX = s.positiveInt.parse(50);

const app = new Hono<Env>()
  .get(
    "/",
    zValidator(
      "query",
      z
        .object({
          page: p //
            .page(PAGE_MAX),
          pageSize: p //
            .pageSize(PAGE_SIZE_MIN, PAGE_SIZE_MAX),
          sort: z
            .union([p.timestamp, z.literal("name")])
            .optional()
            .default("name"),
          direction: p.direction,
        })
        .strict()
        .transform(({ sort, direction: dir, ...rest }) => {
          const direction = dir ?? sort === "name" ? "asc" : "desc";
          return { sort, direction, ...rest } as const;
        }),
      (result, c) => {
        if (!result.success) {
          return c.json(result.error.flatten(), 400);
        }
      },
    ),
    async (c) => {
      const { page, pageSize, sort, direction } = c.req.valid("query");
      const { url } = c.req;

      const sortKey = sort === "createdAt" ? "id" : sort;

      const [authors, count] = await Promise.all([
        c.var.db
          .selectFrom("Author")
          .selectAll()
          .orderBy(sortKey, direction)
          .orderBy("id", direction)
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .execute()
          .then(fmap(createdAt)),
        c.var.db
          .selectFrom("Author")
          .select(({ fn }) => fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
          .then(({ count }) => count),
      ]);

      return c.json(authors, 200, {
        link: linkEntries({
          page,
          pageSize,
          pageMax: PAGE_MAX,
          all: s.nonNegativeInt.parse(count),
          url: new URL(url),
        }),
      });
    },
  )

  .get("/:id", async (c) => {
    const { id } = c.req.param();

    const author = await c.var.db
      .selectFrom("Author")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst()
      .then(fmap(createdAt));

    return author ? c.json(author, 200) : c.json(undefined, 404);
  })

  .post(
    "/",
    zValidator(
      "json",
      z
        .object({
          name: z.string().min(1).max(100),
        })
        .strict(),
      (result, c) => {
        if (!result.success) {
          return c.json(result.error.flatten(), 400);
        }
      },
    ),
    async (c) => {
      const { name } = c.req.valid("json");

      const { id, date } = ulidDate();

      const author = await c.var.db
        .insertInto("Author")
        .values({ id, updatedAt: date, name })
        .returningAll()
        .executeTakeFirstOrThrow()
        .then(fmap(createdAt));

      return c.json(author, 201, {
        "content-location": `${c.req.url}/${author.id}`,
      });
    },
  )

  .patch(
    "/:id",
    zValidator(
      "json",
      z
        .object({
          name: z.string().min(1).max(100),
        })
        .strict()
        .partial(),
      (result, c) => {
        if (!result.success) {
          return c.json(result.error.flatten(), 400);
        }
      },
    ),
    async (c) => {
      const { id } = c.req.param();
      const { name } = c.req.valid("json");

      const author = await c.var.db
        .updateTable("Author")
        .where("id", "=", id)
        .set({ name })
        .returningAll()
        .executeTakeFirst()
        .then(fmap(createdAt));

      return author ? c.json(author, 200) : c.json(undefined, 404);
    },
  )

  .delete("/:id", async (c) => {
    const { id } = c.req.param();

    const author = await c.var.db
      .deleteFrom("Author")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();

    return author ? c.json(undefined, 204) : c.json(undefined, 404);
  })

  .get(
    "/:id/books",
    zValidator(
      "query",
      z
        .object({
          page: p //
            .page(PAGE_MAX),
          pageSize: p //
            .pageSize(PAGE_SIZE_MIN, PAGE_SIZE_MAX),
          sort: z
            .union([p.timestamp, z.literal("title")])
            .optional()
            .default("title"),
          direction: p.direction,
        })
        .strict()
        .transform(({ sort, direction: dir, ...rest }) => {
          const direction = dir ?? sort === "title" ? "asc" : "desc";
          return { sort, direction, ...rest } as const;
        }),
      (result, c) => {
        if (!result.success) {
          return c.json(result.error.flatten(), 400);
        }
      },
    ),
    async (c) => {
      const { id } = c.req.param();
      const { page, pageSize, sort, direction } = c.req.valid("query");
      const { url } = c.req;

      const sortKey = sort === "createdAt" ? "id" : sort;

      const [author, books, count] = await Promise.all([
        c.var.db //
          .selectFrom("Author")
          .where("id", "=", id)
          .select("id")
          .executeTakeFirst(),
        c.var.db
          .selectFrom("AuthorBook")
          .innerJoin("Book", "id", "bookId")
          .where("authorId", "=", id)
          .select(["id", "updatedAt", "title"])
          .orderBy(sortKey, direction)
          .orderBy("id", direction)
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .execute()
          .then(fmap(createdAt)),
        c.var.db
          .selectFrom("AuthorBook")
          .where("authorId", "=", id)
          .select(({ fn }) => fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
          .then(({ count }) => count),
      ]);

      return author
        ? c.json(books, 200, {
            link: linkEntries({
              page,
              pageSize,
              pageMax: PAGE_MAX,
              all: s.nonNegativeInt.parse(count),
              url: new URL(url),
            }),
          })
        : c.json(undefined, 404);
    },
  )

  .post("/:authorId/books/:bookId", async (c) => {
    const { authorId, bookId } = c.req.param();

    const [author, book, authorBook] = await Promise.all([
      c.var.db //
        .selectFrom("Author")
        .where("id", "=", authorId)
        .select("id")
        .executeTakeFirst(),
      c.var.db //
        .selectFrom("Book")
        .where("id", "=", bookId)
        .select("id")
        .executeTakeFirst(),
      c.var.db
        .selectFrom("AuthorBook")
        .where("authorId", "=", authorId)
        .where("bookId", "=", bookId)
        .selectAll()
        .executeTakeFirst(),
    ]);

    if (!author || !book) {
      return c.json(undefined, 404);
    }
    if (authorBook) {
      return c.json("Already Exists", 409); // 409 でいいのか？
    }

    await c.var.db
      .insertInto("AuthorBook")
      .values({ authorId, bookId })
      .returningAll()
      .executeTakeFirstOrThrow();

    return c.json(undefined, 201);
  })

  .delete("/:authorId/books/:bookId", async (c) => {
    const { authorId, bookId } = c.req.param();

    const authorBook = await c.var.db
      .deleteFrom("AuthorBook")
      .where("authorId", "=", authorId)
      .where("bookId", "=", bookId)
      .returningAll()
      .executeTakeFirst();

    return authorBook ? c.json(undefined, 204) : c.json(undefined, 404);
  });

export default app;
