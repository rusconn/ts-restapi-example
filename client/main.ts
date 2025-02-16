import process from "node:process";

import { hcWithType } from "@tre/api/src/hc.ts";

export const client = hcWithType("http://localhost:3000");

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
