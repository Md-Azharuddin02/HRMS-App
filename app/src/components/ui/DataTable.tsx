import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { ReactNode } from "react";
import type { TableState } from "../../hooks/useTable";
import { cn } from "../../utils/format";
import { EmptyState } from "./States";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  sortKey?: string;
  className?: string;
  /** Hide on small screens to keep tables readable on mobile. */
  hideBelow?: "sm" | "md" | "lg" | "xl";
}

const hide = { sm: "hidden sm:table-cell", md: "hidden md:table-cell", lg: "hidden lg:table-cell", xl: "hidden xl:table-cell" };

interface Props<T> {
  table: TableState<T>;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  empty?: ReactNode;
  caption: string;
}

export function DataTable<T>({ table, columns, rowKey, onRowClick, empty, caption }: Props<T>) {
  if (table.total === 0) return <>{empty ?? <EmptyState title="Nothing to show" message={table.query ? "No results match your search." : undefined} />}</>;

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.header} scope="col" className={cn("whitespace-nowrap px-4 py-2.5", c.hideBelow && hide[c.hideBelow], c.className)} aria-sort={sortAria(table, c.sortKey)}>
                  {c.sortKey ? (
                    <button type="button" onClick={() => table.toggleSort(c.sortKey!)} className="inline-flex items-center gap-1 uppercase hover:text-slate-900">
                      {c.header}
                      <SortIcon table={table} sortKey={c.sortKey} />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {table.rows.map((row) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(onRowClick && "cursor-pointer hover:bg-slate-50")}
              >
                {columns.map((c) => (
                  <td key={c.header} className={cn("px-4 py-2.5 align-middle", c.hideBelow && hide[c.hideBelow], c.className)}>
                    {c.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination table={table} />
    </div>
  );
}

function sortAria<T>(table: TableState<T>, key?: string) {
  if (!key || table.sort?.key !== key) return undefined;
  return table.sort.dir === "asc" ? "ascending" : "descending";
}

function SortIcon<T>({ table, sortKey }: { table: TableState<T>; sortKey: string }) {
  if (table.sort?.key !== sortKey) return <ArrowUpDown className="size-3 opacity-40" aria-hidden />;
  return table.sort.dir === "asc" ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />;
}

export function Pagination<T>({ table }: { table: TableState<T> }) {
  if (table.total <= table.pageSize) return null;
  const start = (table.page - 1) * table.pageSize + 1;
  const end = Math.min(table.total, table.page * table.pageSize);
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2.5 text-xs text-slate-500">
      <span>
        {start}–{end} of {table.total}
      </span>
      <div className="flex items-center gap-1">
        <button type="button" className="rounded p-1 hover:bg-slate-100 disabled:opacity-30" disabled={table.page === 1} onClick={() => table.setPage(table.page - 1)} aria-label="Previous page">
          <ChevronLeft className="size-4" />
        </button>
        <span className="px-1">
          Page {table.page} of {table.pageCount}
        </span>
        <button type="button" className="rounded p-1 hover:bg-slate-100 disabled:opacity-30" disabled={table.page === table.pageCount} onClick={() => table.setPage(table.page + 1)} aria-label="Next page">
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  );
}

export function SearchInput({ value, onChange, placeholder = "Search…", className }: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-9 w-full rounded-md border border-slate-300 bg-white pl-8 pr-3 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
    </div>
  );
}
