import { describe, expect, it } from "vitest";
import {
  closeTab, heartbeatTab, inactivityStep, markClosed, readActivity, REOPEN_GRACE_MS, takeClosedBreakStart, type KV,
} from "../modules/attendance/session/lifecycle";
import type { AttendanceRecord, BreakPeriod, BreakType, Employee } from "../types";
import { formatMinutes, isLate, liveState, sessionTotals, workedHours } from "./attendance";
import { classifyDevice, type DeviceSignals } from "./device";
import { whatsappShareUrl, workLogMessage } from "./whatsapp";
import { addDays, countWorkingDays, eachDay, startOfWeek } from "./date";
import { csvCell, toCsv } from "./export";
import { dataScope } from "./permissions";
import { isOverdue } from "./reports";

const rec = (over: Partial<AttendanceRecord> = {}): AttendanceRecord => ({
  id: "a", employeeId: "E1", date: "2026-11-10", checkIn: null, checkOut: null, breaks: [], status: "present",
  state: "not_checked_in", autoCheckedOut: false, lastActivityAt: null,
  totalSessionMinutes: 0, totalBreakMinutes: 0, totalWorkingMinutes: 0, numberOfBreaks: 0, ...over,
});
const brk = (start: string, end: string | null, type: BreakType = "manual"): BreakPeriod => ({ id: `B-${start}`, start, end, type, durationMinutes: 0 });

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

describe("attendance session maths", () => {
  const d = "2026-11-10";
  const at = (hhmm: string, day = d) => new Date(`${day}T${hhmm}:00`).toISOString();

  it("net working = session minus breaks, across several breaks", () => {
    const r = rec({ checkIn: at("09:00"), checkOut: at("18:00"), breaks: [brk(at("11:00"), at("11:15")), brk(at("13:00"), at("13:30"), "inactivity")] });
    expect(sessionTotals(r)).toEqual({ sessionMinutes: 540, breakMinutes: 45, workingMinutes: 495, breaks: 2 });
    expect(workedHours(r)).toBeCloseTo(8.25);
  });
  it("counts an open break up to now", () => {
    const r = rec({ checkIn: at("09:00"), breaks: [brk(at("12:00"), null)] });
    expect(liveState(r)).toBe("on_break");
    expect(sessionTotals(r, new Date(at("12:30")))).toMatchObject({ sessionMinutes: 210, breakMinutes: 30, workingMinutes: 180 });
  });
  it("never double-counts overlapping breaks or goes negative", () => {
    const r = rec({ checkIn: at("09:00"), checkOut: at("10:00"), breaks: [brk(at("08:00"), at("09:30")), brk(at("09:15"), at("11:00"))] });
    expect(sessionTotals(r)).toMatchObject({ sessionMinutes: 60, breakMinutes: 60, workingMinutes: 0 });
  });
  it("handles sessions that cross midnight", () => {
    const r = rec({ checkIn: at("22:00"), checkOut: at("02:00", "2026-11-11"), breaks: [brk(at("23:30"), at("00:30", "2026-11-11"))] });
    expect(sessionTotals(r)).toMatchObject({ sessionMinutes: 240, breakMinutes: 60, workingMinutes: 180 });
  });
  it("applies the grace period for late arrivals", () => {
    const s = { workStartTime: "09:30", lateGraceMinutes: 15 };
    expect(isLate(at("09:45"), d, s)).toBe(false);
    expect(isLate(at("09:46"), d, s)).toBe(true);
  });
  it("derives the session state", () => {
    expect(liveState(null)).toBe("not_checked_in");
    expect(liveState(rec({ checkIn: at("09:00") }))).toBe("working");
    expect(liveState(rec({ checkIn: at("09:00"), checkOut: at("17:00") }))).toBe("checked_out");
    expect(liveState(rec({ checkIn: at("09:00"), checkOut: at("18:30"), autoCheckedOut: true }))).toBe("auto_checked_out");
    expect(formatMinutes(65)).toBe("1h 05m");
    expect(formatMinutes(-5)).toBe("0h 00m");
  });
});

describe("desktop-only device check", () => {
  const sig = (userAgent: string, maxTouchPoints = 0, extra: Partial<DeviceSignals> = {}): DeviceSignals => ({ userAgent, maxTouchPoints, ...extra });
  const MAC = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15";
  it("allows desktops and touch-screen laptops", () => {
    expect(classifyDevice(sig(MAC)).allowed).toBe(true);
    expect(classifyDevice(sig("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130 Safari/537.36", 10)).allowed).toBe(true);
    expect(classifyDevice(sig("Mozilla/5.0 (X11; Linux x86_64) Firefox/131.0")).allowed).toBe(true);
  });
  it("blocks phones and tablets, including iPads with a desktop user agent", () => {
    expect(classifyDevice(sig("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148")).device).toBe("mobile");
    expect(classifyDevice(sig("Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/130 Mobile Safari/537.36")).device).toBe("mobile");
    expect(classifyDevice(sig("Mozilla/5.0 (Linux; Android 13; SM-X710) Chrome/130 Safari/537.36")).device).toBe("tablet");
    expect(classifyDevice(sig("Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X)")).device).toBe("tablet");
    expect(classifyDevice(sig(MAC, 5)).device).toBe("tablet"); // iPadOS "Request desktop website"
    expect(classifyDevice(sig("Mozilla/5.0 (X11; Linux x86_64)", 0, { uaDataMobile: true })).allowed).toBe(false);
  });
});

describe("attendance lifecycle storage", () => {
  const mem = (): KV => {
    const m = new Map<string, string>();
    return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
  };
  it("turns a close into a break start only after the reopen grace period", () => {
    const kv = mem();
    markClosed(kv, "E1", { attendanceId: "A1", at: 1_000_000 });
    expect(takeClosedBreakStart(kv, "E1", "A1", 1_000_000 + REOPEN_GRACE_MS - 1)).toBeNull(); // a refresh
    markClosed(kv, "E1", { attendanceId: "A1", at: 1_000_000 });
    expect(takeClosedBreakStart(kv, "E1", "A1", 1_000_000 + 5 * 60_000)).toBe(1_000_000);
    expect(takeClosedBreakStart(kv, "E1", "A1", 2_000_000)).toBeNull(); // consumed once, no duplicates
    markClosed(kv, "E1", { attendanceId: "OLD", at: 1 });
    expect(takeClosedBreakStart(kv, "E1", "A1", 2_000_000)).toBeNull(); // another day's session
  });
  it("ignores corrupt storage", () => {
    const kv = mem();
    kv.setItem("wfh.att.E1.closedAt", "{not json");
    kv.setItem("wfh.att.E1.lastActivity", "banana");
    expect(takeClosedBreakStart(kv, "E1", "A1", 10)).toBeNull();
    expect(readActivity(kv, "E1")).toBeNull();
    kv.setItem("wfh.att.tabs", '"oops"');
    expect(closeTab(kv, "t1", 10).othersOpen).toBe(false);
  });
  it("knows when another app tab is still open", () => {
    const kv = mem();
    heartbeatTab(kv, "t1", 100_000);
    heartbeatTab(kv, "t2", 100_000);
    expect(closeTab(kv, "t1", 105_000).othersOpen).toBe(true);
    expect(closeTab(kv, "t2", 200_000).othersOpen).toBe(false);
  });
  it("warns before moving to break", () => {
    expect(inactivityStep(54 * 60_000, 55, 60)).toBe("ok");
    expect(inactivityStep(55 * 60_000, 55, 60)).toBe("warn");
    expect(inactivityStep(60 * 60_000, 55, 60)).toBe("break");
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
  const person = (id: string, role: Employee["role"]): Employee => ({
    id, role, firstName: "A", lastName: "B", email: "", phone: "", departmentId: "DEP-DEV", designation: "", joiningDate: "2024-01-01", status: "active", location: "",
  });
  it("limits department heads to their department and employees to themselves", () => {
    expect(dataScope(person("E3", "department_head"))).toEqual({ departmentId: "DEP-DEV" });
    expect(dataScope(person("E5", "employee"))).toEqual({ employeeId: "E5" });
    expect(dataScope(person("E2", "admin"))).toEqual({});
  });
});

describe("overdue flag", () => {
  it("treats completed tasks as never overdue", () => {
    expect(isOverdue({ status: "completed", dueDate: "2020-01-01" }, "2026-11-13")).toBe(false);
    expect(isOverdue({ status: "review", dueDate: "2026-11-12" }, "2026-11-13")).toBe(true);
  });
});

describe("WhatsApp work log sharing", () => {
  const log = { date: "2026-11-13", hours: 7.5, completed: ["Fixed login bug", "Reviewed PR"], ongoing: [], blockers: "", remarks: "Leaving early Friday" };
  it("formats a readable report", () => {
    const text = workLogMessage(log, { name: "Karan Patel", department: "Development" });
    expect(text).toContain("*Daily Work Report · ");
    expect(text).toContain("Karan Patel · Development");
    expect(text).toContain("Hours: 7h 30m");
    expect(text).toContain("*Completed*\n• Fixed login bug\n• Reviewed PR");
    expect(text).not.toContain("*Ongoing*");
    expect(text).toContain("*Blockers*\nNone");
    expect(text).toContain("*Remarks*\nLeaving early Friday");
  });
  it("encodes the text into a wa.me link and caps its length", () => {
    expect(whatsappShareUrl("a & b\n#1")).toBe("https://wa.me/?text=a%20%26%20b%0A%231");
    expect(workLogMessage({ ...log, completed: ["x".repeat(5000)] }, { name: "K" }).length).toBe(3500);
  });
});
