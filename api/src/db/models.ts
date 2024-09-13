// prisma-kysely が生成する型が足りないので用意した
// TODO: 下記プルリクがマージされたらこのファイルは不要になるので消す
// https://github.com/valtyr/prisma-kysely/pull/85

import type { Insertable, Selectable, Updateable } from "kysely";

import type { Author, Book } from "./types.ts";

export type AuthorSelect = Selectable<Author>;
export type AuthorInsert = Insertable<Author>;
export type AuthorUpdate = Updateable<Author>;

export type BookSelect = Selectable<Book>;
export type BookInsert = Insertable<Book>;
export type BookUpdate = Updateable<Book>;
