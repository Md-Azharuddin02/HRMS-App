import type { Department, Report } from "../../types";
import { downloadFile, toCsv } from "../../utils/export";

export function exportEmployeeCsv(report: Report, departments: Department[]) {
  const dep = (id: string) => departments.find((d) => d.id === id)?.name ?? "";
  const csv = toCsv(report.employees, [
    { header: "Employee ID", value: (r) => r.employeeId },
    { header: "Name", value: (r) => r.name },
    { header: "Department", value: (r) => dep(r.departmentId) },
    { header: "Present days", value: (r) => r.presentDays },
    { header: "Late days", value: (r) => r.lateDays },
    { header: "Absent days", value: (r) => r.absentDays },
    { header: "Leave days", value: (r) => r.leaveDays },
    { header: "Total hours", value: (r) => r.totalHours },
    { header: "Avg hours/day", value: (r) => r.avgHours },
    { header: "Tasks assigned", value: (r) => r.tasksAssigned },
    { header: "Tasks completed", value: (r) => r.tasksCompleted },
    { header: "Completion %", value: (r) => r.completionRate },
  ]);
  downloadFile(`employee-report_${report.range.from}_${report.range.to}.csv`, csv);
}

export function exportDepartmentCsv(report: Report) {
  const csv = toCsv(report.departments, [
    { header: "Department", value: (r) => r.name },
    { header: "Headcount", value: (r) => r.headcount },
    { header: "Attendance %", value: (r) => r.attendanceRate },
    { header: "Total hours", value: (r) => r.totalHours },
    { header: "Tasks assigned", value: (r) => r.tasksAssigned },
    { header: "Tasks completed", value: (r) => r.tasksCompleted },
    { header: "Completion %", value: (r) => r.completionRate },
  ]);
  downloadFile(`department-report_${report.range.from}_${report.range.to}.csv`, csv);
}
