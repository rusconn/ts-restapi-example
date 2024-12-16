import { z } from "zod";

export type PositiveInt = z.infer<typeof positiveInt>;
export type NonNegativeInt = z.infer<typeof nonNegativeInt>;
export type AuthorId = z.infer<typeof authorId>;
export type BookId = z.infer<typeof bookId>;

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

const uuid = z //
  .string()
  .uuid()
  .brand("Uuid");

export const authorId = uuid.brand("AuthorId");

export const bookId = uuid.brand("BookId");
