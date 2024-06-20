import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { sha1 } from "hono/utils/crypto";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import { logger } from "../../logger.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().patch(
  "/books/:id",
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
    const { requestId } = c.var;

    const book = await c.var.db
      .updateTable("Book")
      .where("id", "=", id)
      .set({ title })
      .returning(["id", "updatedAt", "title"])
      .executeTakeFirst()
      .then(fmap(createdAt));

    if (!book) {
      return c.json(undefined, 404);
    }

    const etag = await strongETag(book);

    const result = await c.var.cache //
      .set(id, etag)
      .catch((_) => null);

    // db と cache に不整合が発生、cache を更新する必要がある
    if (result !== "OK") {
      logger.fatal({ requestId, book, id, etag }, "cache-failed-log");
      throw new Error("cache failed");
    }

    return c.json(book, 200, { etag });
  },
);

export default app;
