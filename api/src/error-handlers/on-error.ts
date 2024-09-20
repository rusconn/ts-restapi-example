import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

import type { Env } from "../types.ts";

export const onError: ErrorHandler<Env> = (err, c) => {
  c.var.logger.error({ err }, "error-log");

  if (err instanceof HTTPException) {
    return err.getResponse();
  }

  return c.json("Internal Server Error", 500);
};
