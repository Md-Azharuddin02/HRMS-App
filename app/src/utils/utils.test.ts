import { describe, expect, it } from "vitest";
import { createSeed } from "../mock-data";
import type { AttendanceRecord } from "../types";
import { breakHours, isLate, liveState, workedHours } from "./attendance";
import { addDays, countWorkingDays, eachDay, startOfWeek } from "./date";
import { csvCell, toCsv } from "./export";
import { dataScope } from "./permissions";
import { buildReport, dashboardSummary, isOverdue } from "./reports";

const rec = (over: Partial<AttendanceRecord> = {}): AttendanceRecord => ({
  id: "a", employeeId: "E1", date: "2026-11-10", checkIn: null, checkOut: null, breaks: [], status: "present", ...over,
});

describe("date utils", () => {
  it("adds days across month and year boundaries", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(addDays("2026-03-01", -1)).toBe("2026-02-28");
  });
  it("counts working days excluding weekends", () => {
    // Mon 9 Nov – Sun 15 Nov 2026
    expect(countWorkingDays("2026-11-09", "2026-11-15", [0, 6])).toBe(5);
    expect(countWorkingDays("2026-11-14", "2026-11-15", [0, 6])).toBe(0);
    expect(countWorkingDays("2026-11-15", "2026-11-09", [0, 6])).toBe(0);
  });
  it("lists days inclusively and finds Monday week start", () => {
    expect(eachDay("2026-11-09", "2026-11-11")).toEqual(["2026-11-09", "2026-11-10", "2026-11-11"]);
    expect(startOfWeek("2026-11-15")).toBe("2026-11-09");
  });
});

describe("attendance math", () => {
  const d = "2026-11-10";
  const at = (hhmm: string) => new Date(`${d}T${hhmm}:00`).toISOString();

  it("subtracts breaks from worked hours", () => {
    const r = rec({ checkIn: at("09:00"), checkOut: at("18:00"), breaks: [{ start: at("13:00"), end: at("13:30") }] });
    expect(breakHours(r)).toBeCloseTo(0.5);
    expect(workedHours(r)).toBeCloseTo(8.5);
  });
  it("counts an open break up to now", () => {
    const r = rec({ checkIn: at("09:00"), breaks: [{ start: at("12:00"), end: null }] });
    expect(liveState(r)).toBe("on_break");
    expect(workedHours(r, new Date(at("12:30")))).toBeCloseTo(3);
  });
  it("applies the grace period for late arrivals", () => {
    const s = { workStartTime: "09:30", lateGraceMinutes: 15 };
    expect(isLate(at("09:45"), d, s)).toBe(false);
    expect(isLate(at("09:46"), d, s)).toBe(true);
  });
  it("derives live state", () => {
    expect(liveState(null)).toBe("not_started");
    expect(liveState(rec({ checkIn: at("09:00") }))).toBe("working");
    expect(liveState(rec({ checkIn: at("09:00"), checkOut: at("17:00") }))).toBe("checked_out");
  });
});

describe("csv export", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('a,"b"')).toBe('"a,""b"""');
    expect(csvCell("x\ny")).toBe('"x\ny"');
  });
  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=SUM(A1)")).toBe("'=SUM(A1)");
  });
  it("builds header and rows", () => {
    expect(toCsv([{ n: 1 }], [{ header: "N", value: (r) => r.n }])).toBe("N\n1");
  });
});

describe("permissions scope", () => {
  const seed = createSeed(new Date(2026, 10, 13, 12));
  it("limits department heads to their department and employees to themselves", () => {
    const head = seed.employees.find((e) => e.role === "department_head")!;
    const emp = seed.employees.find((e) => e.role === "employee")!;
    expect(dataScope(head)).toEqual({ departmentId: head.departmentId });
    expect(dataScope(emp)).toEqual({ employeeId: emp.id });
    expect(dataScope(seed.employees.find((e) => e.role === "admin")!)).toEqual({});
  });
});

describe("reports on seed data", () => {
  const now = new Date(2026, 10, 13, 12);
  const seed = createSeed(now);
  const input = { ...seed };

  it("dashboard counts add up", () => {
    const s = dashboardSummary(input, "2026-11-13");
    expect(s.present + s.absent + s.onLeave).toBe(s.totalEmployees);
    expect(s.completedTasks + s.pendingTasks).toBe(s.totalTasks);
    expect(s.overdueTasks).toBeGreaterThan(0);
  });
  it("report rows never have negative absences and rates stay within 0–100", () => {
    const r = buildReport(input, { from: "2026-10-14", to: "2026-11-13" }, "2026-11-13", now);
    expect(r.employees.length).toBeGreaterThan(0);
    for (const row of r.employees) {
      expect(row.absentDays).toBeGreaterThanOrEqual(0);
      expect(row.completionRate).toBeGreaterThanOrEqual(0);
      expect(row.completionRate).toBeLessThanOrEqual(100);
    }
    for (const d of r.departments) expect(d.attendanceRate).toBeLessThanOrEqual(100);
  });
  it("treats completed tasks as never overdue", () => {
    expect(isOverdue({ status: "completed", dueDate: "2020-01-01" }, "2026-11-13")).toBe(false);
    expect(isOverdue({ status: "review", dueDate: "2026-11-12" }, "2026-11-13")).toBe(true);
  });
});
