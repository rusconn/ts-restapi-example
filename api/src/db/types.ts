import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Author = {
  id: string;
  updatedAt: Timestamp;
  name: string;
};
export type AuthorBook = {
  authorId: string;
  bookId: string;
};
export type Book = {
  id: string;
  updatedAt: Timestamp;
  title: string;
};
export type DB = {
  Author: Author;
  AuthorBook: AuthorBook;
  Book: Book;
};
