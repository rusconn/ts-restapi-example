import * as z from "zod";

export type PositiveInt = z.infer<typeof positiveInt>;
export type NonNegativeInt = z.infer<typeof nonNegativeInt>;
export type AuthorId = z.infer<typeof authorId>;
export type BookId = z.infer<typeof bookId>;

const int = z.coerce //
  .number()
  .int()
  .brand("Int");

export const nonNegativeInt = int
  .nonnegative() //
  .brand("NonNegativeInt");

export const positiveInt = int
  .positive() //
  .brand("PositiveInt");

export const authorId = z
  .uuid() //
  .brand("AuthorId");

export const bookId = z
  .uuid() //
  .brand("BookId");
