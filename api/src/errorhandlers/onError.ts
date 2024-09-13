import type { ErrorHandler } from "hono";

import { logger as log } from "../logger.ts";
import type { Env } from "../types.ts";

export const onError: ErrorHandler<Env> = (err, c) => {
  const { requestId } = c.var;
  log.error({ requestId, err }, "error-log");
  return c.json("Internal Server Error", 500);
};
