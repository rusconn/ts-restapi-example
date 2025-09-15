import { sql } from "kysely";

import type { db } from "../db/client.ts";

export class HealthAPI {
  #db: typeof db;

  constructor(client: typeof db) {
    this.#db = client;
  }

  check() {
    return sql`select 1`.execute(this.#db);
  }
}
