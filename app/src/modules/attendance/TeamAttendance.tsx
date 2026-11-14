import { useEffect, useMemo, useState } from "react";
import { Field, Input } from "../../components/form/Field";
import { SearchInput } from "../../components/ui/DataTable";
import { QueryView } from "../../components/ui/States";
import { useDirectory } from "../../hooks/useDirectory";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { attendanceService } from "../../services";
import type { AttendanceRecord, ID } from "../../types";
import { liveState } from "../../utils/attendance";
import { isWeekend, today } from "../../utils/date";
import { cn, fullName } from "../../utils/format";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";

type Filter = "all" | "working" | "on_break" | "not_in" | "checked_out" | "on_leave";

const FILTERS: { id: Filter; label: string; dot: string }[] = [
  { id: "all", label: "Everyone", dot: "bg-slate-300" },
  { id: "working", label: "Working", dot: "bg-emerald-500" },
  { id: "on_break", label: "On break", dot: "bg-amber-500" },
  { id: "not_in", label: "Not checked in", dot: "bg-slate-400" },
  { id: "checked_out", label: "Checked out", dot: "bg-blue-500" },
  { id: "on_leave", label: "On leave", dot: "bg-violet-500" },
];

/** A row for someone with no session that day, so they still show up as "not checked in" / absent. */
const noSession = (employeeId: ID, date: string): AttendanceRecord => ({
  id: `none-${employeeId}-${date}`, employeeId, date, checkIn: null, checkOut: null, breaks: [], status: "absent",
  state: "not_checked_in", autoCheckedOut: false, lastActivityAt: null,
  totalSessionMinutes: 0, totalBreakMinutes: 0, totalWorkingMinutes: 0, numberOfBreaks: 0,
});

function bucket(r: AttendanceRecord): Exclude<Filter, "all"> {
  if (!r.checkIn) return r.status === "on_leave" ? "on_leave" : "not_in";
  const s = liveState(r);
  return s === "auto_checked_out" ? "checked_out" : (s as "working" | "on_break" | "checked_out");
}

/** Live team attendance for a day: who is working, on a break, not in yet or done, with break reasons. */
export function TeamAttendance() {
  const { scope, settings } = useSession();
  const dir = useDirectory();
  const [date, setDate] = useState(today());
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const q = useQuery(() => attendanceService.list({ ...scope, from: date, to: date }), [date, scope.departmentId]);

  // Today's view is live: pick up check-ins, breaks and automatic check-outs without a manual refresh.
  const { refetch } = q;
  useEffect(() => {
    if (date !== today()) return;
    const t = setInterval(() => document.visibilityState === "visible" && refetch(), 60_000);
    return () => clearInterval(t);
  }, [date, refetch]);

  const all = useMemo(() => {
    const recs = new Map((q.data ?? []).map((r) => [r.employeeId, r]));
    const people = dir.employees.filter((e) => e.status !== "inactive" && e.joiningDate <= date && (!scope.departmentId || e.departmentId === scope.departmentId));
    return isWeekend(date, settings.weekendDays) ? [...recs.values()] : people.map((e) => recs.get(e.id) ?? noSession(e.id, date));
  }, [q.data, dir, date, scope.departmentId, settings.weekendDays]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: all.length, working: 0, on_break: 0, not_in: 0, checked_out: 0, on_leave: 0 };
    all.forEach((r) => c[bucket(r)]++);
    return c;
  }, [all]);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return all.filter((r) => (filter === "all" || bucket(r) === filter) && (!needle || fullName(dir.employee(r.employeeId)).toLowerCase().includes(needle)));
  }, [all, filter, query, dir]);

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-3">
        <Field label="Date" className="w-44">
          <Input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </Field>
        <SearchInput value={query} onChange={setQuery} placeholder="Search employee…" className="w-56" />
      </div>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 px-3 py-2.5" role="group" aria-label="Filter by attendance state">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
              filter === f.id ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600 hover:bg-slate-50",
            )}
          >
            <span className={`size-2 rounded-full ${f.dot}`} aria-hidden />
            {f.id === "not_in" && date !== today() ? "Absent" : f.label}
            <span className="tabular-nums text-slate-500">{counts[f.id]}</span>
          </button>
        ))}
      </div>
      {isWeekend(date, settings.weekendDays) && <p className="px-4 pt-3 text-xs text-slate-500">This date is a weekend, so only people who worked are listed.</p>}
      <QueryView query={q}>{() => <AttendanceHistoryTable key={date} records={rows} dir={dir} showEmployee pageSize={15} />}</QueryView>
    </div>
  );
}
