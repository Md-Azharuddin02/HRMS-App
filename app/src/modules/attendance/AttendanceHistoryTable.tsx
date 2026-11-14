import { CalendarX } from "lucide-react";
import { AttendanceBadge, BreakTypeBadge, SessionBadge } from "../../components/domain/Badges";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { PersonCell } from "../../components/ui/Misc";
import { EmptyState } from "../../components/ui/States";
import type { Directory } from "../../hooks/useDirectory";
import { useTable } from "../../hooks/useTable";
import type { AttendanceRecord, BreakType } from "../../types";
import { formatMinutes, liveState, sessionTotals } from "../../utils/attendance";
import { formatDate, formatTime, today } from "../../utils/date";
import { fullName } from "../../utils/format";

/** Attendance sessions; set `showEmployee` for team views. Filter `records` before passing them in. */
export function AttendanceHistoryTable({ records, dir, showEmployee, pageSize = 10 }: { records: AttendanceRecord[]; dir?: Directory; showEmployee?: boolean; pageSize?: number }) {
  const table = useTable(records, {
    searchText: (r) => (dir ? fullName(dir.employee(r.employeeId)) : r.employeeId),
    sorters: {
      date: (r) => r.date,
      hours: (r) => sessionTotals(r).workingMinutes,
      breaks: (r) => sessionTotals(r).breakMinutes,
      in: (r) => r.checkIn ?? "",
      activity: (r) => r.lastActivityAt ?? "",
    },
    initialSort: { key: "date", dir: "desc" },
    pageSize,
  });

  const columns: Column<AttendanceRecord>[] = [
    ...(showEmployee && dir ? [{ header: "Employee", cell: (r: AttendanceRecord) => <PersonCell employee={dir.employee(r.employeeId)} subtitle={dir.department(dir.employee(r.employeeId)?.departmentId)?.name} /> }] : []),
    { header: "Date", sortKey: "date", cell: (r) => <span className="whitespace-nowrap">{formatDate(r.date)}</span> },
    {
      header: "Status",
      cell: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.checkIn ? (
            <>
              <SessionBadge state={liveState(r)} />
              <AttendanceBadge status={r.status} />
            </>
          ) : r.status === "absent" && r.date === today() ? (
            <SessionBadge state="not_checked_in" />
          ) : (
            <AttendanceBadge status={r.status} />
          )}
        </div>
      ),
    },
    { header: "Check in", sortKey: "in", cell: (r) => <span className="tabular-nums">{formatTime(r.checkIn)}</span> },
    { header: "Check out", cell: (r) => <span className="tabular-nums">{formatTime(r.checkOut)}</span>, hideBelow: "sm" },
    { header: "Net working", sortKey: "hours", cell: (r) => <span className="tabular-nums font-medium">{r.checkIn ? formatMinutes(sessionTotals(r).workingMinutes) : "—"}</span> },
    { header: "Breaks", sortKey: "breaks", cell: (r) => <BreakSummary record={r} />, hideBelow: "md" },
    ...(showEmployee
      ? [{ header: "Last activity", sortKey: "activity", cell: (r: AttendanceRecord) => <span className="tabular-nums text-slate-600">{formatTime(r.lastActivityAt)}</span>, hideBelow: "lg" as const }]
      : []),
  ];

  return (
    <DataTable
      table={table}
      columns={columns}
      rowKey={(r) => r.id}
      caption="Attendance history"
      empty={<EmptyState icon={CalendarX} title="No attendance records" message="Nothing recorded for the selected period." />}
    />
  );
}

/** Total break time and count, plus one badge per break reason (Manual / Inactivity / App closed). */
function BreakSummary({ record }: { record: AttendanceRecord }) {
  if (!record.breaks.length) return <span className="text-slate-400">—</span>;
  const counts = record.breaks.reduce<Partial<Record<BreakType, number>>>((m, b) => ({ ...m, [b.type]: (m[b.type] ?? 0) + 1 }), {});
  return (
    <div className="space-y-1">
      <span className="block whitespace-nowrap tabular-nums text-slate-700">
        {formatMinutes(sessionTotals(record).breakMinutes)} · {record.breaks.length}
      </span>
      <div className="flex flex-wrap gap-1">
        {(Object.entries(counts) as [BreakType, number][]).map(([type, n]) => (
          <span key={type} className="inline-flex items-center gap-0.5">
            <BreakTypeBadge type={type} />
            {n > 1 && <span className="text-xs text-slate-500">×{n}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
