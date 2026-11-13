import type { ReportService } from "./contracts";
import { db, employeeMatches, respond } from "./mock/db";
import type { Scope } from "../types";
import { today } from "../utils/date";
import { attendanceTrend, buildReport, dashboardSummary, departmentStats, type ReportInput } from "../utils/reports";

function input(scope: Scope = {}): ReportInput {
  const employees = db.employees.filter((e) => employeeMatches(scope, e.id));
  const ids = new Set(employees.map((e) => e.id));
  return {
    employees,
    departments: db.departments,
    attendance: db.attendance.filter((a) => ids.has(a.employeeId)),
    tasks: db.tasks.filter((t) => ids.has(t.assigneeId)),
    leaves: db.leaves,
    settings: db.settings,
  };
}

export const reportService: ReportService = {
  async dashboard(scope) {
    return respond(dashboardSummary(input(scope), today()));
  },

  async departmentStats() {
    return respond(departmentStats(input(), today()));
  },

  async attendanceTrend(range, scope) {
    return respond(attendanceTrend(input(scope), range, today()));
  },

  async report(range, scope) {
    return respond(buildReport(input(scope), range, today(), new Date()), 400);
  },
};
