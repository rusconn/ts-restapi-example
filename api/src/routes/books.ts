import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { linkEntries } from "../lib/pagination/header.ts";
import * as p from "../lib/pagination/schema.ts";
import * as s from "../lib/schema.ts";
import { ulidDate } from "../lib/ulid.ts";
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
      const { page, pageSize, sort, direction } = c.req.valid("query");
      const { url } = c.req;

      const [books, count] = await Promise.all([
        c.var.db
          .selectFrom("Book")
          .selectAll()
          .orderBy(sort, direction)
          .orderBy("id", direction)
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .execute(),
        c.var.db
          .selectFrom("Book")
          .select(({ fn }) => fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
          .then(({ count }) => count),
      ]);

      return c.json(books, 200, {
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

    const book = await c.var.db
      .selectFrom("Book")
      .where("id", "=", id)
      .selectAll()
      .executeTakeFirst();

    return book ? c.json(book, 200) : c.json(undefined, 404);
  })

  .post(
    "/",
    zValidator(
      "json",
      z
        .object({
          title: z.string().min(1).max(100),
        })
        .strict(),
      (result, c) => {
        if (!result.success) {
          return c.json(result.error.flatten(), 400);
        }
      },
    ),
    async (c) => {
      const { title } = c.req.valid("json");

      const { id, date } = ulidDate();

      const book = await c.var.db
        .insertInto("Book")
        .values({ id, createdAt: date, updatedAt: date, title })
        .returningAll()
        .executeTakeFirstOrThrow();

      return c.json(book, 201, {
        "content-location": `${c.req.url}/${book.id}`,
      });
    },
  )

  .patch(
    "/:id",
    zValidator(
      "json",
      z
        .object({
          title: z.string().min(1).max(100),
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
      const { title } = c.req.valid("json");

      const book = await c.var.db
        .updateTable("Book")
        .where("id", "=", id)
        .set({ title })
        .returningAll()
        .executeTakeFirst();

      return book ? c.json(book, 200) : c.json(undefined, 404);
    },
  )

  .delete("/:id", async (c) => {
    const { id } = c.req.param();

    const book = await c.var.db
      .deleteFrom("Book")
      .where("id", "=", id)
      .returning("id")
      .executeTakeFirst();

    return book ? c.json(undefined, 204) : c.json(undefined, 404);
  })

  .get(
    "/:id/authors",
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
      const { id } = c.req.param();
      const { page, pageSize, sort, direction } = c.req.valid("query");
      const { url } = c.req;

      const [book, authors, count] = await Promise.all([
        c.var.db //
          .selectFrom("Book")
          .where("id", "=", id)
          .select("id")
          .executeTakeFirst(),
        c.var.db
          .selectFrom("AuthorBook")
          .innerJoin("Author", "id", "authorId")
          .where("bookId", "=", id)
          .select(["id", "createdAt", "updatedAt", "name"])
          .orderBy(sort, direction)
          .orderBy("id", direction)
          .limit(pageSize)
          .offset((page - 1) * pageSize)
          .execute(),
        c.var.db
          .selectFrom("AuthorBook")
          .where("bookId", "=", id)
          .select(({ fn }) => fn.countAll().as("count"))
          .executeTakeFirstOrThrow()
          .then(({ count }) => count),
      ]);

      return book
        ? c.json(authors, 200, {
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
  );

export default app;
