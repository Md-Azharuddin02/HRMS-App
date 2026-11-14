import type { ReportService } from "./contracts";
import { http } from "./http";
import type { AttendanceTrendPoint, DashboardSummary, DepartmentStat, Report } from "../types";

export const reportService: ReportService = {
  dashboard: (scope) => http.get<DashboardSummary>("/reports/dashboard", { ...scope }),
  departmentStats: () => http.get<DepartmentStat[]>("/reports/departments"),
  attendanceTrend: (range, scope) => http.get<AttendanceTrendPoint[]>("/reports/attendance-trend", { ...range, ...scope }),
  report: (range, scope) => http.get<Report>("/reports/summary", { ...range, ...scope }),
};
