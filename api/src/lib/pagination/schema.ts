import * as z from "zod";

import * as s from "../schema.ts";

export type Page = z.infer<ReturnType<typeof page>>;
export type PageSize = NonNullable<z.infer<ReturnType<typeof pageSize>>>;

export const page = (max: s.PositiveInt) =>
  s.positiveInt //
    .max(max)
    .optional()
    .default(1 as s.PositiveInt)
    .brand("Page");

export const pageSize = (min: s.PositiveInt, max: s.PositiveInt) =>
  s.positiveInt //
    .min(min)
    .max(max)
    .optional()
    .default(30 as s.PositiveInt)
    .brand("PageSize");

export const timestamp = z //
  .enum(["createdAt", "updatedAt"]);

export const direction = z
  .enum(["asc", "desc"]) //
  .optional();
