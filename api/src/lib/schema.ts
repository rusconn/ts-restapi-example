import { z } from "zod";

export type PositiveInt = z.infer<typeof positiveInt>;
export type NonNegativeInt = z.infer<typeof nonNegativeInt>;

const int = z.coerce //
  .number()
  .int()
  .brand("Int");

export const nonNegativeInt = int //
  .unwrap()
  .nonnegative()
  .brand("NonNegativeInt");

export const positiveInt = int //
  .unwrap()
  .positive()
  .brand("PositiveInt");
