import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export interface TableOptions<T> {
  /** Text the search box matches against. */
  searchText: (row: T) => string;
  /** Sortable columns and how to read their value. */
  sorters: Record<string, (row: T) => string | number>;
  initialSort?: { key: string; dir: SortDir };
  pageSize?: number;
}

/** Client-side search, sort and pagination for a list. */
export function useTable<T>(rows: T[], opts: TableOptions<T>) {
  const [query, setQueryRaw] = useState("");
  const [sort, setSort] = useState(opts.initialSort ?? null);
  const [page, setPage] = useState(1);
  const pageSize = opts.pageSize ?? 10;
  const { searchText, sorters } = opts;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? rows.filter((r) => searchText(r).toLowerCase().includes(q)) : [...rows];
    if (sort && sorters[sort.key]) {
      const get = sorters[sort.key];
      list.sort((a, b) => {
        const x = get(a);
        const y = get(b);
        const cmp = typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y));
        return sort.dir === "asc" ? cmp : -cmp;
      });
    }
    return list;
  }, [rows, query, sort, searchText, sorters]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pageCount);

  return {
    query,
    setQuery: (q: string) => {
      setQueryRaw(q);
      setPage(1);
    },
    sort,
    toggleSort: (key: string) =>
      setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" })),
    page: current,
    setPage,
    pageCount,
    pageSize,
    total: filtered.length,
    rows: filtered.slice((current - 1) * pageSize, current * pageSize),
    all: filtered,
  };
}

export type TableState<T> = ReturnType<typeof useTable<T>>;
