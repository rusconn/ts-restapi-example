import { hc } from "hono/client";

import type app from "./app.ts";

// this is a trick to calculate the type when compiling
const client = hc<typeof app>("");
export type Client = typeof client;

export const hcWithType = (...args: Parameters<typeof hc>): Client => {
  return hc<typeof app>(...args);
};
