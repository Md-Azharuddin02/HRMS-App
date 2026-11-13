// Pure report math. Kept free of the data source so a real backend can reuse or replace it.
import type {
  AppSettings, AttendanceRecord, AttendanceTrendPoint, DashboardSummary, DateRange, Department, DepartmentReportRow,
  DepartmentStat, Employee, EmployeeReportRow, LeaveRequest, Report, Task,
} from "../types";
import { workedHours, liveState, isPresentStatus } from "./attendance";
import { countWorkingDays, eachDay, isWeekend } from "./date";
import { pct } from "./format";

export interface ReportInput {
  employees: Employee[]; // already scoped
  departments: Department[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  leaves: LeaveRequest[];
  settings: AppSettings;
}

const onApprovedLeave = (leaves: LeaveRequest[], empId: string, date: string) =>
  leaves.some((l) => l.employeeId === empId && l.status === "approved" && l.startDate <= date && l.endDate >= date);

export function dashboardSummary(d: ReportInput, todayStr: string): DashboardSummary {
  const active = d.employees.filter((e) => e.status !== "inactive");
  const ids = new Set(active.map((e) => e.id));
  const recs = d.attendance.filter((a) => a.date === todayStr && ids.has(a.employeeId));
  const present = recs.filter((r) => isPresentStatus(r.status)).length;
  const onLeave = active.filter((e) => recs.find((r) => r.employeeId === e.id)?.status === "on_leave" || onApprovedLeave(d.leaves, e.id, todayStr)).length;
  const tasks = d.tasks.filter((t) => ids.has(t.assigneeId));
  const completed = tasks.filter((t) => t.status === "completed").length;
  return {
    totalEmployees: active.length,
    present,
    onLeave,
    absent: Math.max(0, active.length - present - onLeave),
    working: recs.filter((r) => liveState(r) === "working").length,
    onBreak: recs.filter((r) => liveState(r) === "on_break").length,
    totalTasks: tasks.length,
    completedTasks: completed,
    pendingTasks: tasks.length - completed,
    overdueTasks: tasks.filter((t) => isOverdue(t, todayStr)).length,
  };
}

export const isOverdue = (t: Pick<Task, "status" | "dueDate">, todayStr: string) => t.status !== "completed" && t.dueDate < todayStr;

export function departmentStats(d: ReportInput, todayStr: string): DepartmentStat[] {
  return d.departments.map((dep) => {
    const emps = d.employees.filter((e) => e.departmentId === dep.id && e.status !== "inactive");
    const ids = new Set(emps.map((e) => e.id));
    const tasks = d.tasks.filter((t) => t.departmentId === dep.id);
    return {
      departmentId: dep.id,
      name: dep.name,
      color: dep.color,
      employees: emps.length,
      present: d.attendance.filter((a) => a.date === todayStr && ids.has(a.employeeId) && isPresentStatus(a.status)).length,
      openTasks: tasks.filter((t) => t.status !== "completed").length,
      completedTasks: tasks.filter((t) => t.status === "completed").length,
    };
  });
}

export function attendanceTrend(d: ReportInput, range: DateRange, todayStr: string): AttendanceTrendPoint[] {
  const to = range.to > todayStr ? todayStr : range.to;
  return eachDay(range.from, to)
    .filter((day) => !isWeekend(day, d.settings.weekendDays))
    .map((date) => {
      const emps = d.employees.filter((e) => e.joiningDate <= date && e.status !== "inactive");
      const recs = new Map(d.attendance.filter((a) => a.date === date).map((a) => [a.employeeId, a]));
      const point = { date, present: 0, late: 0, absent: 0, onLeave: 0 };
      for (const e of emps) {
        const s = recs.get(e.id)?.status;
        if (s === "on_leave") point.onLeave++;
        else if (s === "late") point.late++;
        else if (s && isPresentStatus(s)) point.present++;
        else point.absent++;
      }
      return point;
    });
}

export function buildReport(d: ReportInput, range: DateRange, todayStr: string, now: Date): Report {
  const to = range.to > todayStr ? todayStr : range.to;
  const employees: EmployeeReportRow[] = d.employees
    .filter((e) => e.status !== "inactive")
    .map((e) => {
      const from = e.joiningDate > range.from ? e.joiningDate : range.from;
      const expected = countWorkingDays(from, to, d.settings.weekendDays);
      const recs = d.attendance.filter((a) => a.employeeId === e.id && a.date >= range.from && a.date <= to);
      const presentDays = recs.filter((r) => isPresentStatus(r.status)).length;
      const leaveDays = recs.filter((r) => r.status === "on_leave").length;
      const totalHours = recs.reduce((s, r) => s + workedHours(r, now), 0);
      const tasks = d.tasks.filter((t) => t.assigneeId === e.id && t.dueDate >= range.from && t.dueDate <= range.to);
      const done = tasks.filter((t) => t.status === "completed").length;
      return {
        employeeId: e.id,
        name: `${e.firstName} ${e.lastName}`,
        departmentId: e.departmentId,
        presentDays,
        lateDays: recs.filter((r) => r.status === "late").length,
        leaveDays,
        absentDays: Math.max(0, expected - presentDays - leaveDays),
        totalHours: round1(totalHours),
        avgHours: presentDays ? round1(totalHours / presentDays) : 0,
        tasksAssigned: tasks.length,
        tasksCompleted: done,
        completionRate: pct(done, tasks.length),
      };
    });

  const departments: DepartmentReportRow[] = d.departments
    .map((dep) => {
      const rows = employees.filter((r) => r.departmentId === dep.id);
      const expected = rows.reduce((s, r) => s + r.presentDays + r.absentDays, 0);
      const assigned = rows.reduce((s, r) => s + r.tasksAssigned, 0);
      const completed = rows.reduce((s, r) => s + r.tasksCompleted, 0);
      return {
        departmentId: dep.id,
        name: dep.name,
        headcount: rows.length,
        attendanceRate: pct(rows.reduce((s, r) => s + r.presentDays, 0), expected),
        totalHours: round1(rows.reduce((s, r) => s + r.totalHours, 0)),
        tasksAssigned: assigned,
        tasksCompleted: completed,
        completionRate: pct(completed, assigned),
      };
    })
    .filter((r) => r.headcount > 0);

  return {
    range,
    workingDays: countWorkingDays(range.from, to, d.settings.weekendDays),
    employees,
    departments,
    trend: attendanceTrend(d, range, todayStr),
  };
}

const round1 = (n: number) => Math.round(n * 10) / 10;
