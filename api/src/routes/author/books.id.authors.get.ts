import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import * as z from "zod";

import { linkEntries } from "../../lib/pagination/header.ts";
import * as p from "../../lib/pagination/schema.ts";
import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const PAGE_MAX = s.positiveInt.parse(100);
const PAGE_SIZE_MIN = s.positiveInt.parse(1);
const PAGE_SIZE_MAX = s.positiveInt.parse(50);

const app = new Hono<Env>().get(
  "/books/:id/authors",
  etag(),
  zValidator("param", z.object({ id: s.bookId }), (result, c) => {
    if (!result.success) {
      return c.json(z.treeifyError(result.error), 400);
    }
  }),
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
        const direction = dir ?? (sort === "name" ? "asc" : "desc");
        return { sort, direction, ...rest } as const;
      }),
    (result, c) => {
      if (!result.success) {
        return c.json(z.treeifyError(result.error), 400);
      }
    },
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { page, pageSize, sort, direction } = c.req.valid("query");
    const { url } = c.req;

    const sortKey = sort === "createdAt" ? "id" : sort;

    const [book, authors, count] = await Promise.all([
      c.var.api.book.isExists(id),
      c.var.api.author.getsByBookId(id, { sortKey, direction, page, pageSize }),
      c.var.api.authorBook.countByBookId(id),
    ]);

    return book
      ? c.json(authors, 200, {
          "cache-control": "public, max-age=0, must-revalidate",
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
