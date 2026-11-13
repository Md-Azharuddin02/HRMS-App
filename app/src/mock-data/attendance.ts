import type { AppSettings, AttendanceRecord, Employee, LeaveRequest } from "../types";
import { addDays, atTime, isWeekend } from "../utils/date";
import { random } from "./random";

const HISTORY_DAYS = 60;

/**
 * Plausible attendance for the last 60 days plus "today so far".
 * Demo users (the role-switcher accounts) get no record for today so you can try Check In yourself.
 */
export function buildAttendance(
  employees: Employee[],
  leaves: LeaveRequest[],
  settings: AppSettings,
  now: Date,
  todayStr: string,
  demoIds: string[],
): AttendanceRecord[] {
  const rand = random(42);
  const out: AttendanceRecord[] = [];
  const onLeave = (empId: string, date: string) =>
    leaves.some((l) => l.employeeId === empId && l.status === "approved" && l.startDate <= date && l.endDate >= date);

  for (const emp of employees) {
    if (emp.status === "inactive") continue;
    for (let back = HISTORY_DAYS; back >= 0; back--) {
      const date = addDays(todayStr, -back);
      if (date < emp.joiningDate || isWeekend(date, settings.weekendDays)) continue;
      const isToday = back === 0;
      if (isToday && demoIds.includes(emp.id)) continue;
      const id = `ATT-${emp.id}-${date}`;

      if (onLeave(emp.id, date)) {
        out.push({ id, employeeId: emp.id, date, checkIn: null, checkOut: null, breaks: [], status: "on_leave" });
        continue;
      }
      const roll = rand();
      if (roll < 0.05) {
        out.push({ id, employeeId: emp.id, date, checkIn: null, checkOut: null, breaks: [], status: "absent" });
        continue;
      }
      const late = roll < 0.17;
      const inMinute = late ? 47 + Math.floor(rand() * 50) : Math.floor(rand() * 40) - 25; // relative to 09:30 start
      const checkIn = new Date(atTime(date, settings.workStartTime).getTime() + inMinute * 60_000);
      if (isToday && checkIn > now) continue; // hasn't arrived yet

      const breakStart = atTime(date, `13:${String(Math.floor(rand() * 30)).padStart(2, "0")}`);
      const breakEnd = new Date(breakStart.getTime() + (30 + Math.floor(rand() * 25)) * 60_000);
      const checkOut = new Date(atTime(date, settings.workEndTime).getTime() + (Math.floor(rand() * 80) - 20) * 60_000);

      const breaks = [];
      if (!isToday || breakStart < now) {
        breaks.push({ start: breakStart.toISOString(), end: !isToday || breakEnd < now ? breakEnd.toISOString() : null });
      }
      out.push({
        id, employeeId: emp.id, date,
        checkIn: checkIn.toISOString(),
        checkOut: !isToday || checkOut < now ? checkOut.toISOString() : null,
        breaks,
        status: late ? "late" : "present",
      });
    }
  }
  return out;
}
