// prisma-kysely が生成する型が足りないので用意した
// TODO: 下記プルリクがマージされたらこのファイルは不要になるので消す
// https://github.com/valtyr/prisma-kysely/pull/85

import type { Selectable } from "kysely";

import type { Author, Book } from "./types.ts";

export type AuthorSelect = Selectable<Author>;
export type BookSelect = Selectable<Book>;
