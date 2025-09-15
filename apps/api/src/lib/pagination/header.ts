import * as s from "../schema.ts";
import * as p from "./schema.ts";

type LinkEntriesParams = {
  page: p.Page;
  pageSize: p.PageSize;
  pageMax?: s.PositiveInt;
  all: s.NonNegativeInt;
  url: URL;
};

export const linkEntries = ({ page, pageSize, pageMax, all, url }: LinkEntriesParams) => {
  if (all === 0) {
    return [];
  }

  const pages = Math.ceil(all / pageSize);

  const first = 1;
  const last = pageMax ? Math.min(pages, pageMax) : pages;
  const prev = page - 1;
  const next = page + 1;

  const relPages = new Map<"first" | "prev" | "next" | "last", number>();

  relPages.set("first", first);
  if (first < page && prev <= last) {
    relPages.set("prev", prev);
  }
  if (page < last) {
    relPages.set("next", next);
  }
  relPages.set("last", last);

  return relPages
    .entries()
    .map(([rel, page]) => {
      url.searchParams.set("page", page.toString());
      return `<${url}>; rel=${rel}` as const;
    })
    .toArray();
};

if (import.meta.vitest) {
  type ToParamsParams = {
    page: number;
    pageSize: number;
    pageMax?: number;
    all: number;
    url: string;
  };

  const toParams = ({ page, pageSize, pageMax, all, url }: ToParamsParams) => ({
    page: p.page(s.positiveInt.parse(page)).parse(page),
    pageSize: p.pageSize(s.positiveInt.parse(1), s.positiveInt.parse(pageSize)).parse(pageSize),
    ...(pageMax != null && {
      pageMax: s.positiveInt.parse(pageMax),
    }),
    all: s.nonNegativeInt.parse(all),
    url: new URL(url),
  });

  const base = "http://example.com/list";

  describe("entry existence and page number correctness", () => {
    const patterns = [
      [
        toParams({ page: 3, pageSize: 30, all: 0, url: base }), //
        [
          //
        ],
      ],
      [
        toParams({ page: 1, pageSize: 30, all: 1, url: base }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=1>; rel=last`,
        ],
      ],
      [
        toParams({ page: 1, pageSize: 30, all: 30, url: base }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=1>; rel=last`,
        ],
      ],
      [
        toParams({ page: 1, pageSize: 30, all: 31, url: base }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=2>; rel=next`,
          `<${base}?page=2>; rel=last`,
        ],
      ],
      [
        toParams({ page: 2, pageSize: 30, all: 60, url: `${base}?page=2` }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=1>; rel=prev`,
          `<${base}?page=2>; rel=last`,
        ],
      ],
      [
        toParams({ page: 2, pageSize: 30, all: 61, url: `${base}?page=2` }),
        [
          `<${base}?page=1>; rel=first`,
          `<${base}?page=1>; rel=prev`,
          `<${base}?page=3>; rel=next`,
          `<${base}?page=3>; rel=last`,
        ],
      ],
      [
        toParams({ page: 3, pageSize: 30, all: 61, url: `${base}?page=3` }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=2>; rel=prev`,
          `<${base}?page=3>; rel=last`,
        ],
      ],
      [
        toParams({ page: 4, pageSize: 30, all: 61, url: `${base}?page=4` }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=3>; rel=prev`,
          `<${base}?page=3>; rel=last`,
        ],
      ],
      [
        toParams({ page: 5, pageSize: 30, all: 61, url: `${base}?page=5` }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=3>; rel=last`,
        ],
      ],
    ] as const;

    test.each(patterns)("patterns %#", (params, expected) => {
      expect(linkEntries(params)).toStrictEqual(expected);
    });
  });

  describe("search params modification", () => {
    const patterns = [
      [
        toParams({ page: 1, pageSize: 30, all: 31, url: `${base}` }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=2>; rel=next`,
          `<${base}?page=2>; rel=last`,
        ],
      ],
      [
        toParams({ page: 1, pageSize: 30, all: 31, url: `${base}?page=1` }),
        [
          //
          `<${base}?page=1>; rel=first`,
          `<${base}?page=2>; rel=next`,
          `<${base}?page=2>; rel=last`,
        ],
      ],
      [
        toParams({ page: 1, pageSize: 30, all: 31, url: `${base}?pageSize=30` }),
        [
          `<${base}?pageSize=30&page=1>; rel=first`,
          `<${base}?pageSize=30&page=2>; rel=next`,
          `<${base}?pageSize=30&page=2>; rel=last`,
        ],
      ],
      [
        toParams({ page: 1, pageSize: 30, all: 31, url: `${base}?page=1&pageSize=30` }),
        [
          `<${base}?page=1&pageSize=30>; rel=first`,
          `<${base}?page=2&pageSize=30>; rel=next`,
          `<${base}?page=2&pageSize=30>; rel=last`,
        ],
      ],
    ] as const;

    test.each(patterns)("patterns %#", (params, expected) => {
      expect(linkEntries(params)).toStrictEqual(expected);
    });
  });
}
