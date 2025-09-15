import type { NotFoundHandler } from "hono";

import type { Env } from "../types.ts";

export const notFound: NotFoundHandler<Env> = (c) => {
  return c.json("Not Found", 404);
};
