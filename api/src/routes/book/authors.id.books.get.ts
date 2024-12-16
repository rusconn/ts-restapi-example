import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { etag } from "hono/etag";
import { z } from "zod";

import { linkEntries } from "../../lib/pagination/header.ts";
import * as p from "../../lib/pagination/schema.ts";
import * as s from "../../lib/schema.ts";
import type { Env } from "../../types.ts";

const PAGE_MAX = s.positiveInt.parse(100);
const PAGE_SIZE_MIN = s.positiveInt.parse(1);
const PAGE_SIZE_MAX = s.positiveInt.parse(50);

const app = new Hono<Env>().get(
  "/authors/:id/books",
  etag(),
  zValidator("param", z.object({ id: s.authorId }), (result, c) => {
    if (!result.success) {
      return c.json(result.error.flatten(), 400);
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
          .union([p.timestamp, z.literal("title")])
          .optional()
          .default("title"),
        direction: p.direction,
      })
      .strict()
      .transform(({ sort, direction: dir, ...rest }) => {
        const direction = dir ?? (sort === "title" ? "asc" : "desc");
        return { sort, direction, ...rest } as const;
      }),
    (result, c) => {
      if (!result.success) {
        return c.json(result.error.flatten(), 400);
      }
    },
  ),
  async (c) => {
    const { id } = c.req.valid("param");
    const { page, pageSize, sort, direction } = c.req.valid("query");
    const { url } = c.req;

    const sortKey = sort === "createdAt" ? "id" : sort;

    const [author, books, count] = await Promise.all([
      c.var.api.author.isExists(id),
      c.var.api.book.getsByAuthorId(id, { sortKey, direction, page, pageSize }),
      c.var.api.authorBook.countByAuthorId(id),
    ]);

    return author
      ? c.json(books, 200, {
          "cache-control": "public, max-age=0, must-revalidate",
          link: linkEntries({
            page,
            pageSize,
            pageMax: PAGE_MAX,
            all: count,
            url: new URL(url),
          }),
        })
      : c.json(undefined, 404);
  },
);

export default app;
