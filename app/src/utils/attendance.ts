import type { AttendanceRecord, AppSettings, AttendanceStatus } from "../types";
import { atTime } from "./date";

const HOUR = 3_600_000;

/** Total break time in hours; an open break counts up to `now`. */
export function breakHours(rec: AttendanceRecord, now: Date = new Date()): number {
  return rec.breaks.reduce((sum, b) => {
    const end = b.end ? new Date(b.end) : now;
    return sum + Math.max(0, end.getTime() - new Date(b.start).getTime()) / HOUR;
  }, 0);
}

/** Net worked hours (check-in → check-out or now, minus breaks). */
export function workedHours(rec: AttendanceRecord, now: Date = new Date()): number {
  if (!rec.checkIn) return 0;
  const end = rec.checkOut ? new Date(rec.checkOut) : now;
  const gross = Math.max(0, end.getTime() - new Date(rec.checkIn).getTime()) / HOUR;
  return Math.max(0, gross - breakHours(rec, now));
}

export function isLate(checkIn: string, date: string, settings: Pick<AppSettings, "workStartTime" | "lateGraceMinutes">): boolean {
  const limit = atTime(date, settings.workStartTime).getTime() + settings.lateGraceMinutes * 60_000;
  return new Date(checkIn).getTime() > limit;
}

export type LiveState = "not_started" | "working" | "on_break" | "checked_out";

export function liveState(rec: AttendanceRecord | null | undefined): LiveState {
  if (!rec?.checkIn) return "not_started";
  if (rec.checkOut) return "checked_out";
  return rec.breaks.some((b) => !b.end) ? "on_break" : "working";
}

/** Counts a record towards "present" in stats. */
export const isPresentStatus = (s: AttendanceStatus) => s === "present" || s === "late" || s === "half_day";
