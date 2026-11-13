import type { AttendanceService } from "./contracts";
import { ServiceError, db, employeeMatches, logActivity, respond, save } from "./mock/db";
import type { AttendanceRecord, ID } from "../types";
import { today } from "../utils/date";
import { isLate, liveState } from "../utils/attendance";

function todayRecord(employeeId: ID) {
  return db.attendance.find((a) => a.employeeId === employeeId && a.date === today()) ?? null;
}

function requireOpen(employeeId: ID): AttendanceRecord {
  const rec = todayRecord(employeeId);
  if (!rec?.checkIn) throw new ServiceError("You have not checked in today");
  if (rec.checkOut) throw new ServiceError("You have already checked out today");
  return rec;
}

export const attendanceService: AttendanceService = {
  async getToday(employeeId) {
    return respond(todayRecord(employeeId), 150);
  },

  async list({ from, to, ...scope }) {
    return respond(
      db.attendance.filter((a) => (!from || a.date >= from) && (!to || a.date <= to) && employeeMatches(scope, a.employeeId)),
    );
  },

  async checkIn(employeeId) {
    const existing = todayRecord(employeeId);
    if (existing?.status === "on_leave") throw new ServiceError("You are on approved leave today");
    if (existing?.checkIn) throw new ServiceError("You have already checked in today");
    const now = new Date().toISOString();
    const rec: AttendanceRecord = {
      id: `ATT-${employeeId}-${today()}`,
      employeeId, date: today(), checkIn: now, checkOut: null, breaks: [],
      status: isLate(now, today(), db.settings) ? "late" : "present",
    };
    db.attendance = db.attendance.filter((a) => a !== existing).concat(rec);
    logActivity(employeeId, "attendance", rec.status === "late" ? "checked in (late)" : "checked in");
    save();
    return respond(rec, 150);
  },

  async checkOut(employeeId) {
    const rec = requireOpen(employeeId);
    const now = new Date().toISOString();
    const open = rec.breaks.find((b) => !b.end);
    if (open) open.end = now;
    rec.checkOut = now;
    logActivity(employeeId, "attendance", "checked out");
    save();
    return respond(rec, 150);
  },

  async startBreak(employeeId) {
    const rec = requireOpen(employeeId);
    if (liveState(rec) === "on_break") throw new ServiceError("You are already on a break");
    rec.breaks.push({ start: new Date().toISOString(), end: null });
    save();
    return respond(rec, 150);
  },

  async endBreak(employeeId) {
    const rec = requireOpen(employeeId);
    const open = rec.breaks.find((b) => !b.end);
    if (!open) throw new ServiceError("You are not on a break");
    open.end = new Date().toISOString();
    save();
    return respond(rec, 150);
  },
};
