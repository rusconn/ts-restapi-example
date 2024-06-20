import { Hono } from "hono";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import { logger } from "../../logger.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().get("/books/:id", async (c) => {
  const { id } = c.req.param();
  const ifNoneMatch = c.req.header("if-none-match");
  const { requestId } = c.var;

  let etag = await c.var.cache //
    .get(id)
    .catch((_) => null);

  if (ifNoneMatch === etag) {
    return c.json(undefined, 304);
  }

  const book = await c.var.db
    .selectFrom("Book")
    .where("id", "=", id)
    .select(["id", "updatedAt", "title"])
    .executeTakeFirst()
    .then(fmap(createdAt));

  if (!book) {
    return c.json(undefined, 404);
  }

  if (!etag) {
    etag = await strongETag(book);

    const result = await c.var.cache //
      .set(id, etag)
      .catch((_) => null);

    if (result !== "OK") {
      logger.error({ requestId, book, id, etag }, "cache-failed-log");
    }
  }

  return c.json(book, 200, { etag });
});

export default app;
