import type { WorkLogService } from "./contracts";
import { ServiceError, db, employeeMatches, findOr404, logActivity, respond, save } from "./mock/db";
import { today } from "../utils/date";

export const workLogService: WorkLogService = {
  async list({ from, to, ...scope }) {
    return respond(
      db.workLogs
        .filter((w) => (!from || w.date >= from) && (!to || w.date <= to) && employeeMatches(scope, w.employeeId))
        .sort((a, b) => b.date.localeCompare(a.date)),
    );
  },

  /** One log per employee per day: saving again for the same date updates it. */
  async save(input) {
    if (input.date > today()) throw new ServiceError("Work logs can't be submitted for future dates");
    if (!input.completed.length && !input.ongoing.length) throw new ServiceError("Add at least one completed or ongoing item");
    const existing = db.workLogs.find((w) => w.employeeId === input.employeeId && w.date === input.date);
    const log = { ...input, id: existing?.id ?? `WL-${input.employeeId}-${input.date}`, submittedAt: new Date().toISOString() };
    db.workLogs = db.workLogs.filter((w) => w !== existing).concat(log);
    logActivity(input.employeeId, "worklog", existing ? "updated a daily work log" : "submitted a daily work log");
    save();
    return respond(log);
  },

  async remove(id) {
    findOr404(db.workLogs, id, "Work log");
    db.workLogs = db.workLogs.filter((w) => w.id !== id);
    save();
    return respond(undefined);
  },
};
