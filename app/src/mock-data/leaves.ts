import type { LeaveRequest, LeaveStatus, LeaveType } from "../types";
import { addDays, atTime, countWorkingDays } from "../utils/date";

type Row = [employee: string, type: LeaveType, startOffset: number, endOffset: number, status: LeaveStatus, reason: string, reviewer?: string, note?: string];

const rows: Row[] = [
  ["EMP-022", "earned", -2, 4, "approved", "Family wedding out of town.", "EMP-004", "Enjoy! Handover noted."],
  ["EMP-005", "casual", 6, 6, "pending", "Personal errand at the bank."],
  ["EMP-010", "sick", 2, 3, "pending", "Doctor advised rest after minor surgery."],
  ["EMP-014", "earned", 9, 13, "pending", "Annual vacation."],
  ["EMP-019", "casual", 1, 1, "pending", "Moving to a new apartment."],
  ["EMP-006", "sick", -12, -11, "approved", "Fever and cold.", "EMP-003", ""],
  ["EMP-011", "casual", -20, -20, "approved", "Attending a convocation.", "EMP-009", ""],
  ["EMP-018", "earned", -30, -26, "approved", "Trip with family.", "EMP-017", "Approved, please share SEO handover."],
  ["EMP-005", "sick", -25, -25, "approved", "Migraine.", "EMP-003", ""],
  ["EMP-016", "casual", -8, -8, "rejected", "Personal work.", "EMP-013", "Brand guidelines deadline that day — please pick another date."],
  ["EMP-020", "unpaid", -40, -36, "approved", "Extended travel.", "EMP-002", ""],
  ["EMP-012", "casual", -15, -15, "approved", "Festival at home.", "EMP-009", ""],
  ["EMP-021", "sick", -5, -5, "approved", "Food poisoning.", "EMP-004", "Get well soon."],
  ["EMP-007", "earned", 15, 19, "pending", "Planned holiday."],
  ["EMP-015", "casual", -3, -3, "rejected", "Personal.", "EMP-013", "Research sessions already booked with participants."],
];

export function buildLeaves(todayStr: string, weekendDays: number[]): LeaveRequest[] {
  return rows.map(([employeeId, type, s, e, status, reason, reviewer, note], i) => {
    const startDate = addDays(todayStr, s);
    const endDate = addDays(todayStr, e);
    const appliedDay = addDays(todayStr, Math.min(s, 0) - 4);
    return {
      id: `LV-${String(i + 201)}`,
      employeeId, type, startDate, endDate, reason, status,
      days: Math.max(1, countWorkingDays(startDate, endDate, weekendDays)),
      appliedAt: atTime(appliedDay, "11:20").toISOString(),
      reviewedById: reviewer ?? null,
      reviewedAt: reviewer ? atTime(addDays(appliedDay, 1), "15:00").toISOString() : null,
      reviewNote: note ?? "",
    };
  });
}
