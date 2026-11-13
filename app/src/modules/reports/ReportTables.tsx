import { DeptChip } from "../../components/domain/Badges";
import { DataTable, SearchInput, type Column } from "../../components/ui/DataTable";
import { PersonCell, Progress } from "../../components/ui/Misc";
import type { Directory } from "../../hooks/useDirectory";
import { useTable } from "../../hooks/useTable";
import type { DepartmentReportRow, EmployeeReportRow } from "../../types";
import { formatHours } from "../../utils/date";

const Rate = ({ value, label }: { value: number; label: string }) => (
  <div className="flex min-w-24 items-center gap-2">
    <Progress value={value} label={label} className="w-14" color={value >= 80 ? "bg-emerald-500" : value >= 50 ? "bg-amber-500" : "bg-red-400"} />
    <span className="tabular-nums text-xs text-slate-600">{value}%</span>
  </div>
);

export function EmployeeReportTable({ rows, dir }: { rows: EmployeeReportRow[]; dir: Directory }) {
  const table = useTable(rows, {
    searchText: (r) => r.name,
    sorters: {
      name: (r) => r.name, present: (r) => r.presentDays, late: (r) => r.lateDays, absent: (r) => r.absentDays,
      hours: (r) => r.totalHours, avg: (r) => r.avgHours, rate: (r) => r.completionRate,
    },
    initialSort: { key: "name", dir: "asc" },
    pageSize: 12,
  });
  const columns: Column<EmployeeReportRow>[] = [
    { header: "Employee", sortKey: "name", cell: (r) => <PersonCell employee={dir.employee(r.employeeId)} subtitle={dir.department(r.departmentId)?.name} /> },
    { header: "Present", sortKey: "present", cell: (r) => <span className="tabular-nums">{r.presentDays}</span> },
    { header: "Late", sortKey: "late", cell: (r) => <span className={r.lateDays ? "tabular-nums text-amber-700" : "tabular-nums"}>{r.lateDays}</span>, hideBelow: "sm" },
    { header: "Absent", sortKey: "absent", cell: (r) => <span className={r.absentDays ? "tabular-nums text-red-700" : "tabular-nums"}>{r.absentDays}</span>, hideBelow: "sm" },
    { header: "Leave", cell: (r) => <span className="tabular-nums">{r.leaveDays}</span>, hideBelow: "md" },
    { header: "Hours", sortKey: "hours", cell: (r) => <span className="whitespace-nowrap tabular-nums">{formatHours(r.totalHours)}</span> },
    { header: "Avg/day", sortKey: "avg", cell: (r) => <span className="whitespace-nowrap tabular-nums">{formatHours(r.avgHours)}</span>, hideBelow: "lg" },
    { header: "Tasks done", cell: (r) => <span className="tabular-nums">{r.tasksCompleted}/{r.tasksAssigned}</span>, hideBelow: "md" },
    { header: "Completion", sortKey: "rate", cell: (r) => (r.tasksAssigned ? <Rate value={r.completionRate} label={`${r.name} task completion`} /> : <span className="text-xs text-slate-400">No tasks due</span>), hideBelow: "lg" },
  ];
  return (
    <>
      <div className="border-b border-slate-100 p-3">
        <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search employee…" className="w-full sm:w-64" />
      </div>
      <DataTable table={table} columns={columns} rowKey={(r) => r.employeeId} caption="Employee-wise report" />
    </>
  );
}

export function DepartmentReportTable({ rows, dir }: { rows: DepartmentReportRow[]; dir: Directory }) {
  const table = useTable(rows, {
    searchText: (r) => r.name,
    sorters: { name: (r) => r.name, att: (r) => r.attendanceRate, hours: (r) => r.totalHours, rate: (r) => r.completionRate },
    initialSort: { key: "name", dir: "asc" },
  });
  const columns: Column<DepartmentReportRow>[] = [
    { header: "Department", sortKey: "name", cell: (r) => <DeptChip department={dir.department(r.departmentId)} /> },
    { header: "Headcount", cell: (r) => <span className="tabular-nums">{r.headcount}</span>, hideBelow: "sm" },
    { header: "Attendance", sortKey: "att", cell: (r) => <Rate value={r.attendanceRate} label={`${r.name} attendance rate`} /> },
    { header: "Hours", sortKey: "hours", cell: (r) => <span className="whitespace-nowrap tabular-nums">{formatHours(r.totalHours)}</span> },
    { header: "Tasks done", cell: (r) => <span className="tabular-nums">{r.tasksCompleted}/{r.tasksAssigned}</span>, hideBelow: "md" },
    { header: "Completion", sortKey: "rate", cell: (r) => <Rate value={r.completionRate} label={`${r.name} task completion`} />, hideBelow: "sm" },
  ];
  return <DataTable table={table} columns={columns} rowKey={(r) => r.departmentId} caption="Department-wise report" />;
}
