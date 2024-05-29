import process from "node:process";

import { hc } from "hono/client";

import type { API } from "@tre/api/src/app.ts";

const client = hc<API>("http://localhost:3000");
const response = await client.authors.$get({
  query: {
    page: "2",
    pageSize: "1",
  },
});

if (!response.ok) {
  console.log(response.status);
  console.log(await response.json());
  process.exit(1);
}

if (response.status === 200) {
  const books = await response.json();
  console.log(response.headers.get("link")?.split(", "));
  console.log(books);
}
