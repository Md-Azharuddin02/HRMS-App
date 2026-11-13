import { CalendarX } from "lucide-react";
import { AttendanceBadge } from "../../components/domain/Badges";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { PersonCell } from "../../components/ui/Misc";
import { EmptyState } from "../../components/ui/States";
import type { Directory } from "../../hooks/useDirectory";
import { useTable } from "../../hooks/useTable";
import type { AttendanceRecord } from "../../types";
import { breakHours, workedHours } from "../../utils/attendance";
import { formatDate, formatHours, formatTime } from "../../utils/date";
import { fullName } from "../../utils/format";

/** Attendance rows; set `showEmployee` for team views. Filter `records` before passing them in. */
export function AttendanceHistoryTable({ records, dir, showEmployee, pageSize = 10 }: { records: AttendanceRecord[]; dir?: Directory; showEmployee?: boolean; pageSize?: number }) {
  const table = useTable(records, {
    searchText: (r) => (dir ? fullName(dir.employee(r.employeeId)) : r.employeeId),
    sorters: { date: (r) => r.date, hours: (r) => workedHours(r), in: (r) => r.checkIn ?? "" },
    initialSort: { key: "date", dir: "desc" },
    pageSize,
  });

  const columns: Column<AttendanceRecord>[] = [
    ...(showEmployee && dir ? [{ header: "Employee", cell: (r: AttendanceRecord) => <PersonCell employee={dir.employee(r.employeeId)} subtitle={dir.department(dir.employee(r.employeeId)?.departmentId)?.name} /> }] : []),
    { header: "Date", sortKey: "date", cell: (r) => <span className="whitespace-nowrap">{formatDate(r.date)}</span> },
    { header: "Status", cell: (r) => <AttendanceBadge status={r.status} /> },
    { header: "Check in", sortKey: "in", cell: (r) => <span className="tabular-nums">{formatTime(r.checkIn)}</span> },
    { header: "Check out", cell: (r) => <span className="tabular-nums">{r.checkIn && !r.checkOut ? <span className="text-emerald-700">Working</span> : formatTime(r.checkOut)}</span>, hideBelow: "sm" },
    { header: "Breaks", cell: (r) => <span className="tabular-nums text-slate-600">{r.breaks.length ? formatHours(breakHours(r)) : "—"}</span>, hideBelow: "md" },
    { header: "Worked", sortKey: "hours", cell: (r) => <span className="tabular-nums font-medium">{r.checkIn ? formatHours(workedHours(r)) : "—"}</span> },
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
