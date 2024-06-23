import { type ErrorLogEvent, Kysely, PostgresDialect } from "kysely";
import pg from "pg";

import { connectionString, isProd } from "../config.ts";
import { logger } from "../logger.ts";
import { UpdatedAtPlugin } from "./plugins.ts";
import type { DB } from "./types.ts";

const [logQuery, logError] = isProd
  ? [
      (obj: object) => logger.info(obj, "query-log"),
      (event: ErrorLogEvent) => logger.error(event, "query-error-log"),
    ]
  : [
      (obj: object) => console.log("kysely:query", obj),
      (event: ErrorLogEvent) => console.error("%o", event),
    ];

export const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new pg.Pool({
      connectionString,
    }),
  }),
  plugins: [new UpdatedAtPlugin()],
  log(event) {
    switch (event.level) {
      case "query":
        logQuery({
          sql: event.query.sql,
          params: isProd ? "***" : event.query.parameters,
          duration: `${Math.round(event.queryDurationMillis)}ms`,
        });
        break;
      case "error":
        logError(event);
        break;
    }
  },
});
