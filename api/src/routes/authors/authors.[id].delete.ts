import { Hono } from "hono";

import { strongETag } from "../../lib/etag.ts";
import type { Env } from "../../types.ts";

const app = new Hono<Env>().delete("/authors/:id", async (c) => {
  const { id } = c.req.param();
  const ifMatch = c.req.header("if-match");

  if (ifMatch) {
    const { type } = await c.var.api.author.deleteWithCheck(
      id,
      async (got) => (await strongETag(got)) === ifMatch,
    );

    const statuses = {
      notFound: 404,
      checkError: 412,
      success: 204,
    } as const;

    return c.json(undefined, statuses[type]);
  } else {
    const deleted = await c.var.api.author.delete(id);

    return c.json(undefined, deleted ? 204 : 404);
  }
});

export default app;
