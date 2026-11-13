import type { Activity, AppNotification, Employee, LeaveRequest, Task } from "../types";
import { formatDate } from "../utils/date";

const minsAgo = (now: Date, m: number) => new Date(now.getTime() - m * 60_000).toISOString();

/** Notifications seeded from tasks and leaves so they link to real records. */
export function buildNotifications(tasks: Task[], leaves: LeaveRequest[], employees: Employee[], todayStr: string, now: Date): AppNotification[] {
  const nameOf = (id: string) => {
    const e = employees.find((x) => x.id === id);
    return e ? `${e.firstName} ${e.lastName}` : id;
  };
  const out: AppNotification[] = [];
  let n = 0;
  const push = (x: Omit<AppNotification, "id">) => out.push({ ...x, id: `NTF-${++n}` });

  tasks.filter((t) => t.status !== "completed").slice(0, 32).forEach((t, i) => {
    push({ recipientId: t.assigneeId, type: "task_assigned", title: "New task assigned", message: `You were assigned “${t.title}”.`, link: `/tasks/${t.id}`, createdAt: t.createdAt, read: i % 3 === 0 });
    if (t.dueDate < todayStr) {
      push({ recipientId: t.assigneeId, type: "task_overdue", title: "Task overdue", message: `“${t.title}” passed its deadline.`, link: `/tasks/${t.id}`, createdAt: minsAgo(now, 60 + i * 7), read: false });
    }
  });

  const approvers = ["EMP-001", "EMP-002", "EMP-004"];
  leaves.filter((l) => l.status === "pending").forEach((l, i) => {
    approvers.forEach((a) =>
      push({ recipientId: a, type: "leave_applied", title: "Leave request", message: `${nameOf(l.employeeId)} applied for ${l.days} day(s) of ${l.type} leave.`, link: "/leave", createdAt: minsAgo(now, 30 + i * 45), read: false }),
    );
  });
  leaves.filter((l) => l.status !== "pending" && l.reviewedAt).forEach((l) => {
    push({
      recipientId: l.employeeId,
      type: l.status === "approved" ? "leave_approved" : "leave_rejected",
      title: l.status === "approved" ? "Leave approved" : "Leave rejected",
      message: `Your ${l.type} leave from ${formatDate(l.startDate)} was ${l.status}.`,
      link: "/leave", createdAt: l.reviewedAt!, read: true,
    });
  });
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function buildActivities(now: Date): Activity[] {
  const rows: [number, string, Activity["kind"], string][] = [
    [8, "EMP-010", "task", "moved “Regression suite for release 4.2” to In Progress"],
    [22, "EMP-005", "task", "submitted “Fix pagination bug on employee table” for review"],
    [41, "EMP-019", "leave", "applied for casual leave"],
    [65, "EMP-013", "task", "assigned “Refresh icon set” to Nikhil Bose"],
    [90, "EMP-004", "leave", "approved earned leave for Manish Tiwari"],
    [130, "EMP-007", "worklog", "submitted a daily work log"],
    [180, "EMP-002", "employee", "updated the profile of Neha Gupta"],
    [240, "EMP-017", "task", "created “Monthly performance report”"],
    [320, "EMP-001", "system", "updated attendance late-arrival grace period to 15 minutes"],
    [600, "EMP-009", "task", "marked “Verify bug fixes from sprint 31” Completed"],
  ];
  return rows.map(([m, actorId, kind, message], i) => ({ id: `ACT-${i + 1}`, at: minsAgo(now, m), actorId, kind, message }));
}
