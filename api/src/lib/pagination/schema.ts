import { z } from "zod";

import * as s from "../schema.ts";

export type Page = z.infer<ReturnType<typeof page>>;
export type PageSize = NonNullable<z.infer<ReturnType<typeof pageSize>>>;

export const page = (max: s.PositiveInt) =>
  s.positiveInt //
    .unwrap()
    .max(max)
    .brand("Page")
    .optional()
    .default(1);

export const pageSize = (min: s.PositiveInt, max: s.PositiveInt) =>
  s.positiveInt //
    .unwrap()
    .min(min)
    .max(max)
    .brand("PageSize")
    .optional()
    .default(30);

export const timestamp = z //
  .enum(["createdAt", "updatedAt"]);

export const direction = z
  .enum(["asc", "desc"]) //
  .optional();
