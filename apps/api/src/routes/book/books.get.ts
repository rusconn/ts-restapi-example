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
  "/books",
  etag(),
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
        return c.json(z.treeifyError(result.error), 400);
      }
    },
  ),
  async (c) => {
    const { page, pageSize, sort, direction } = c.req.valid("query");
    const { url } = c.req;

    const sortKey = sort === "createdAt" ? "id" : sort;

    const [books, count] = await Promise.all([
      c.var.api.book.gets({ sortKey, direction, page, pageSize }),
      c.var.api.book.count(),
    ]);

    return c.json(books, 200, {
      "cache-control": "public, max-age=0, must-revalidate",
      link: linkEntries({
        page,
        pageSize,
        pageMax: PAGE_MAX,
        all: s.nonNegativeInt.parse(count),
        url: new URL(url),
      }),
    });
  },
);

export default app;
