import type { AttendanceStatus, BreakType, EmploymentStatus, LeaveStatus, LeaveType, SessionState, TaskPriority, TaskStatus } from "../types";

export const STATUS_LABEL: Record<TaskStatus, string> = { todo: "To Do", in_progress: "In Progress", review: "Review", completed: "Completed" };
export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "completed"];

export const PRIORITY_LABEL: Record<TaskPriority, string> = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };
export const PRIORITIES: TaskPriority[] = ["low", "medium", "high", "critical"];
export const PRIORITY_RANK: Record<TaskPriority, number> = { low: 0, medium: 1, high: 2, critical: 3 };

export const LEAVE_TYPE_LABEL: Record<LeaveType, string> = { casual: "Casual", sick: "Sick", earned: "Earned", unpaid: "Unpaid" };
export const LEAVE_TYPES: LeaveType[] = ["casual", "sick", "earned", "unpaid"];
export const LEAVE_STATUS_LABEL: Record<LeaveStatus, string> = { pending: "Pending", approved: "Approved", rejected: "Rejected" };

export const ATTENDANCE_LABEL: Record<AttendanceStatus, string> = {
  present: "Present", late: "Late", absent: "Absent", on_leave: "On leave", half_day: "Half day",
};

export const SESSION_STATE_LABEL: Record<SessionState, string> = {
  not_checked_in: "Not checked in", working: "Working", on_break: "On break", checked_out: "Checked out", auto_checked_out: "Auto checked out",
};
export const SESSION_STATES: SessionState[] = ["working", "on_break", "not_checked_in", "checked_out", "auto_checked_out"];

export const BREAK_TYPE_LABEL: Record<BreakType, string> = { manual: "Manual", inactivity: "Inactivity", tab_closed: "App closed" };

export const EMPLOYMENT_LABEL: Record<EmploymentStatus, string> = {
  active: "Active", probation: "Probation", on_leave: "On leave", inactive: "Inactive",
};
export const EMPLOYMENT_STATUSES: EmploymentStatus[] = ["active", "probation", "on_leave", "inactive"];
