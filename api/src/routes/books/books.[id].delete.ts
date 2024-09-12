import { Hono } from "hono";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/books/:id", async (c) => {
  const { id } = c.req.param();
  const ifMatch = c.req.header("if-match");

  if (ifMatch) {
    const book = await c.var.db
      .selectFrom("Book")
      .where("id", "=", id)
      .select(["id", "updatedAt", "title"])
      .executeTakeFirst()
      .then(fmap(createdAt));

    if (!book) {
      return c.json(undefined, 404);
    }
    if (ifMatch !== (await strongETag(book))) {
      return c.json("Precondition Failed", 412);
    }
  }

  const book = await c.var.db
    .deleteFrom("Book")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  return book ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
