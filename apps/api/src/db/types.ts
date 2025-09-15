import type { ColumnType, Insertable, Selectable, Updateable } from "kysely";
export type Generated<T> =
  T extends ColumnType<infer S, infer I, infer U>
    ? ColumnType<S, I | undefined, U>
    : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type AuthorTable = {
  id: string;
  updatedAt: Timestamp;
  name: string;
};
export type Author = Selectable<AuthorTable>;
export type NewAuthor = Insertable<AuthorTable>;
export type AuthorUpdate = Updateable<AuthorTable>;
export type AuthorBookTable = {
  authorId: string;
  bookId: string;
};
export type AuthorBook = Selectable<AuthorBookTable>;
export type NewAuthorBook = Insertable<AuthorBookTable>;
export type AuthorBookUpdate = Updateable<AuthorBookTable>;
export type BookTable = {
  id: string;
  updatedAt: Timestamp;
  title: string;
};
export type Book = Selectable<BookTable>;
export type NewBook = Insertable<BookTable>;
export type BookUpdate = Updateable<BookTable>;
export type DB = {
  Author: AuthorTable;
  AuthorBook: AuthorBookTable;
  Book: BookTable;
};
