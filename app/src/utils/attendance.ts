import type { AttendanceRecord, AppSettings, AttendanceStatus, SessionState } from "../types";
import { atTime } from "./date";

const MIN = 60_000;

export interface SessionTotals {
  sessionMinutes: number;
  breakMinutes: number;
  workingMinutes: number;
  breaks: number;
}

/**
 * Session maths, identical to the API's (HRMS-APIs app/services/attendance.py) so live timers match reports.
 * Session = check-in → check-out (or now). Breaks are clipped to the session and never double-counted,
 * so overlapping or out-of-range intervals can't produce negative or inflated totals. An open break counts up to now.
 */
export function sessionTotals(rec: AttendanceRecord, now: Date = new Date()): SessionTotals {
  if (!rec.checkIn) return { sessionMinutes: 0, breakMinutes: 0, workingMinutes: 0, breaks: 0 };
  const checkIn = new Date(rec.checkIn).getTime();
  const sessionEnd = Math.max(rec.checkOut ? new Date(rec.checkOut).getTime() : now.getTime(), checkIn);
  let coveredUntil = checkIn;
  let breakMs = 0;
  for (const b of [...rec.breaks].sort((x, y) => x.start.localeCompare(y.start))) {
    const lo = Math.max(new Date(b.start).getTime(), coveredUntil);
    const hi = Math.min(b.end ? new Date(b.end).getTime() : now.getTime(), sessionEnd);
    breakMs += Math.max(0, hi - lo);
    coveredUntil = Math.max(coveredUntil, hi);
  }
  const sessionMs = sessionEnd - checkIn;
  return {
    sessionMinutes: Math.round(sessionMs / MIN),
    breakMinutes: Math.round(breakMs / MIN),
    workingMinutes: Math.round(Math.max(0, sessionMs - breakMs) / MIN),
    breaks: rec.breaks.length,
  };
}

/** Total break time in hours; an open break counts up to `now`. */
export const breakHours = (rec: AttendanceRecord, now: Date = new Date()) => sessionTotals(rec, now).breakMinutes / 60;

/** Net working hours: session duration minus breaks. */
export const workedHours = (rec: AttendanceRecord, now: Date = new Date()) => sessionTotals(rec, now).workingMinutes / 60;

export function isLate(checkIn: string, date: string, settings: Pick<AppSettings, "workStartTime" | "lateGraceMinutes">): boolean {
  const limit = atTime(date, settings.workStartTime).getTime() + settings.lateGraceMinutes * MIN;
  return new Date(checkIn).getTime() > limit;
}

export function liveState(rec: AttendanceRecord | null | undefined): SessionState {
  if (!rec?.checkIn) return "not_checked_in";
  if (rec.checkOut) return rec.autoCheckedOut ? "auto_checked_out" : "checked_out";
  return rec.breaks.some((b) => !b.end) ? "on_break" : "working";
}

export const openBreak = (rec: AttendanceRecord | null | undefined) => rec?.breaks.find((b) => !b.end) ?? null;

/** Counts a record towards "present" in stats. */
export const isPresentStatus = (s: AttendanceStatus) => s === "present" || s === "late" || s === "half_day";

/** "1h 05m" style, for minute counts. */
export function formatMinutes(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, "0")}m`;
}
