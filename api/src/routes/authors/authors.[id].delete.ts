import { Hono } from "hono";

import { strongETag } from "../../lib/etag.ts";
import { fmap } from "../../lib/functor.ts";
import { createdAt } from "../../lib/ulid.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/authors/:id", async (c) => {
  const { id } = c.req.param();
  const ifMatch = c.req.header("if-match");

  if (ifMatch) {
    const author = await c.var.db
      .selectFrom("Author")
      .where("id", "=", id)
      .select(["id", "updatedAt", "name"])
      .executeTakeFirst()
      .then(fmap(createdAt));

    if (!author) {
      return c.json(undefined, 404);
    }
    if (ifMatch !== (await strongETag(author))) {
      return c.json("Precondition Failed", 412);
    }
  }

  const author = await c.var.db
    .deleteFrom("Author")
    .where("id", "=", id)
    .returning("id")
    .executeTakeFirst();

  return author ? c.json(undefined, 204) : c.json(undefined, 404);
});

export default app;
