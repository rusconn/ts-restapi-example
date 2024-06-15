import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { fmap } from "../../lib/functor.ts";
import { linkEntries } from "../../lib/pagination/header.ts";
import * as p from "../../lib/pagination/schema.ts";
import * as s from "../../lib/schema.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const PAGE_MAX = s.positiveInt.parse(100);
const PAGE_SIZE_MIN = s.positiveInt.parse(1);
const PAGE_SIZE_MAX = s.positiveInt.parse(50);

const app = new Hono<Env>().get(
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
);

export default app;
