import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt, ulidDate } from "../../lib/ulid.ts";
import { logger } from "../../logger.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().post(
  "/books",
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
    const { requestId } = c.var;

    const { id, date } = ulidDate();

    const book = await c.var.db
      .insertInto("Book")
      .values({ id, updatedAt: date, title })
      .returning(["id", "updatedAt", "title"])
      .executeTakeFirstOrThrow()
      .then(fmap(createdAt));

    const etag = await strongETag(book);

    const result = await c.var.cache //
      .set(id, etag)
      .catch((_) => null);

    if (result !== "OK") {
      logger.error({ requestId, book, id, etag }, "cache-failed-log");
    }

    return c.json(book, 201, {
      "content-location": `${c.req.url}/${book.id}`,
    });
  },
);

export default app;
