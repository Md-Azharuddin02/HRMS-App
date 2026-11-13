import type { LeaveService } from "./contracts";
import { ServiceError, approversFor, db, employeeMatches, findOr404, logActivity, nameOf, notify, respond, save } from "./mock/db";
import type { ID, LeaveBalance } from "../types";
import { countWorkingDays } from "../utils/date";
import { LEAVE_TYPES, LEAVE_TYPE_LABEL } from "../utils/labels";
import { uid } from "../utils/format";

function computeBalances(employeeId: ID): LeaveBalance[] {
  const year = String(new Date().getFullYear());
  const mine = db.leaves.filter((l) => l.employeeId === employeeId && l.startDate.startsWith(year));
  return LEAVE_TYPES.map((type) => ({
    type,
    allowance: type === "unpaid" ? null : db.settings.leaveAllowances[type],
    used: mine.filter((l) => l.type === type && l.status === "approved").reduce((s, l) => s + l.days, 0),
    pending: mine.filter((l) => l.type === type && l.status === "pending").reduce((s, l) => s + l.days, 0),
  }));
}

export const leaveService: LeaveService = {
  async list(scope) {
    return respond(
      db.leaves.filter((l) => employeeMatches(scope, l.employeeId)).sort((a, b) => b.appliedAt.localeCompare(a.appliedAt)),
    );
  },

  async balances(employeeId) {
    return respond(computeBalances(employeeId), 150);
  },

  async apply(input) {
    if (input.endDate < input.startDate) throw new ServiceError("End date must be on or after the start date");
    const days = countWorkingDays(input.startDate, input.endDate, db.settings.weekendDays);
    if (days === 0) throw new ServiceError("The selected dates fall entirely on weekends");
    const overlap = db.leaves.some(
      (l) => l.employeeId === input.employeeId && l.status !== "rejected" && l.startDate <= input.endDate && l.endDate >= input.startDate,
    );
    if (overlap) throw new ServiceError("You already have a leave request covering these dates");
    const bal = computeBalances(input.employeeId).find((b) => b.type === input.type)!;
    if (bal.allowance !== null && bal.used + bal.pending + days > bal.allowance) {
      throw new ServiceError(`Not enough ${LEAVE_TYPE_LABEL[input.type].toLowerCase()} leave: ${bal.allowance - bal.used - bal.pending} day(s) available`);
    }
    const req = {
      ...input, id: uid("LV"), days, status: "pending" as const, appliedAt: new Date().toISOString(),
      reviewedById: null, reviewedAt: null, reviewNote: "",
    };
    db.leaves.unshift(req);
    approversFor(input.employeeId).forEach((recipientId) =>
      notify({ recipientId, type: "leave_applied", title: "Leave request", message: `${nameOf(input.employeeId)} applied for ${days} day(s) of ${input.type} leave.`, link: "/leave" }),
    );
    logActivity(input.employeeId, "leave", `applied for ${input.type} leave`);
    save();
    return respond(req);
  },

  async review(id, decision, reviewerId, note) {
    const req = findOr404(db.leaves, id, "Leave request");
    if (req.status !== "pending") throw new ServiceError("This request has already been reviewed");
    if (req.employeeId === reviewerId) throw new ServiceError("You can't review your own leave request");
    Object.assign(req, { status: decision, reviewedById: reviewerId, reviewedAt: new Date().toISOString(), reviewNote: note });
    notify({
      recipientId: req.employeeId,
      type: decision === "approved" ? "leave_approved" : "leave_rejected",
      title: decision === "approved" ? "Leave approved" : "Leave rejected",
      message: `${nameOf(reviewerId)} ${decision} your ${req.type} leave${note ? `: “${note}”` : "."}`,
      link: "/leave",
    });
    logActivity(reviewerId, "leave", `${decision} ${req.type} leave for ${nameOf(req.employeeId)}`);
    save();
    return respond(req);
  },

  async cancel(id) {
    const req = findOr404(db.leaves, id, "Leave request");
    if (req.status !== "pending") throw new ServiceError("Only pending requests can be withdrawn");
    db.leaves = db.leaves.filter((l) => l.id !== id);
    save();
    return respond(undefined);
  },
};
