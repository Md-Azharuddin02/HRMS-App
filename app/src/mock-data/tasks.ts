import type { Employee, Task, TaskPriority, TaskStatus } from "../types";
import { addDays, atTime } from "../utils/date";

type Row = [title: string, assignee: string, creator: string, priority: TaskPriority, status: TaskStatus, dueOffset: number, createdOffset: number, description: string];

// Offsets are days relative to today, so the board always has overdue, due-soon and done work.
const rows: Row[] = [
  ["Migrate auth screens to new design system", "EMP-005", "EMP-003", "high", "in_progress", 3, -6, "Replace legacy login, register and reset-password screens with the new component library."],
  ["Fix pagination bug on employee table", "EMP-005", "EMP-003", "medium", "review", 1, -4, "Page count is wrong when filters reduce the result set below one page."],
  ["Build attendance export endpoint contract", "EMP-006", "EMP-003", "high", "todo", 5, -2, "Agree the request/response shape with the integrations team before implementation."],
  ["Optimise dashboard queries", "EMP-006", "EMP-003", "critical", "in_progress", -1, -9, "Dashboard summary takes >3s for org-wide view. Target under 800ms."],
  ["Add rate limiting to public forms", "EMP-007", "EMP-001", "high", "todo", -3, -12, "Contact and enquiry forms are being spammed. Add per-IP throttling."],
  ["Refactor notification service", "EMP-007", "EMP-003", "medium", "completed", -5, -15, "Split delivery channels into separate adapters."],
  ["Write unit tests for leave calculator", "EMP-008", "EMP-003", "low", "in_progress", 6, -3, "Cover weekends, half days and cross-month ranges."],
  ["Set up error tracking in staging", "EMP-007", "EMP-001", "medium", "completed", -8, -18, "Wire the frontend error boundary to the monitoring dashboard."],
  ["Upgrade router to latest minor", "EMP-008", "EMP-003", "low", "todo", 10, -1, "Check release notes for breaking changes in loaders."],
  ["Regression suite for release 4.2", "EMP-010", "EMP-009", "critical", "in_progress", 2, -5, "Full regression on web and mobile web before Friday's release."],
  ["Automate checkout smoke tests", "EMP-011", "EMP-009", "high", "in_progress", 4, -7, "Cover happy path plus declined payment and timeout."],
  ["Triage backlog of flaky tests", "EMP-011", "EMP-009", "medium", "todo", -2, -10, "Quarantine or fix the 14 tests that failed intermittently last sprint."],
  ["Test plan for attendance module", "EMP-012", "EMP-009", "medium", "review", 0, -4, "Include late arrival, break and overnight-shift edge cases."],
  ["Accessibility audit of dashboard", "EMP-012", "EMP-009", "high", "todo", 7, -2, "WCAG 2.1 AA: contrast, keyboard navigation, screen reader labels."],
  ["Verify bug fixes from sprint 31", "EMP-010", "EMP-009", "low", "completed", -4, -11, "Re-test and close all bugs marked fixed."],
  ["Design empty states for reports", "EMP-014", "EMP-013", "medium", "in_progress", 2, -5, "Illustration-free empty states with clear next actions."],
  ["Usability study: task board", "EMP-015", "EMP-013", "high", "review", -1, -14, "Five moderated sessions with team leads; synthesise findings."],
  ["Refresh icon set", "EMP-016", "EMP-013", "low", "todo", 12, -2, "Align stroke widths and corner radii across all product icons."],
  ["Mobile navigation prototype", "EMP-014", "EMP-013", "high", "completed", -6, -16, "Bottom sheet navigation for screens under 640px."],
  ["Brand guidelines v2", "EMP-016", "EMP-013", "medium", "in_progress", -4, -20, "Update colour, typography and logo usage pages."],
  ["Q4 campaign landing page copy", "EMP-019", "EMP-017", "high", "in_progress", 1, -6, "Headline, three benefit sections and FAQ."],
  ["Keyword research for HR software", "EMP-018", "EMP-017", "medium", "completed", -7, -15, "Top 50 keywords with difficulty and intent."],
  ["Fix crawl errors in search console", "EMP-018", "EMP-017", "critical", "todo", -2, -6, "38 pages returning 404 after the URL migration."],
  ["Set up retargeting audience", "EMP-020", "EMP-017", "medium", "in_progress", 3, -4, "Visitors to pricing page in the last 30 days, excluding customers."],
  ["Monthly performance report", "EMP-020", "EMP-017", "low", "todo", 8, -1, "Spend, CPA and conversions by channel."],
  ["Webinar promotion emails", "EMP-019", "EMP-017", "medium", "completed", -3, -12, "Three-email sequence with reminders."],
  ["Onboarding checklist for new joiners", "EMP-021", "EMP-004", "medium", "in_progress", 4, -5, "Day 1, week 1 and month 1 checklist with owners."],
  ["Shortlist candidates for QA role", "EMP-022", "EMP-004", "high", "todo", -1, -8, "Screen applications and shortlist five for interview."],
  ["Update leave policy document", "EMP-021", "EMP-002", "low", "review", 6, -3, "Reflect the new earned-leave carry-forward rule."],
  ["Plan quarterly team offsite", "EMP-004", "EMP-002", "medium", "todo", 14, -2, "Venue options, agenda and budget for 25 people."],
  ["Review sprint velocity trends", "EMP-003", "EMP-001", "medium", "in_progress", 2, -3, "Compare last six sprints and flag blockers."],
  ["Hiring plan for next quarter", "EMP-002", "EMP-001", "high", "review", 5, -6, "Headcount by department with budget impact."],
];

export function buildTasks(employees: Employee[], todayStr: string): Task[] {
  const deptOf = new Map(employees.map((e) => [e.id, e.departmentId]));
  return rows.map(([title, assigneeId, createdById, priority, status, dueOffset, createdOffset, description], i) => {
    const id = `TSK-${String(i + 101)}`;
    const createdAt = atTime(addDays(todayStr, createdOffset), "10:15").toISOString();
    const activity = [{ id: `${id}-a1`, at: createdAt, actorId: createdById, message: "created the task and assigned it" }];
    if (status !== "todo") {
      activity.push({ id: `${id}-a2`, at: atTime(addDays(todayStr, createdOffset + 1), "11:40").toISOString(), actorId: assigneeId, message: "moved status to In Progress" });
    }
    if (status === "review" || status === "completed") {
      activity.push({ id: `${id}-a3`, at: atTime(addDays(todayStr, Math.min(-1, dueOffset - 1)), "16:05").toISOString(), actorId: assigneeId, message: "moved status to Review" });
    }
    const completedAt = status === "completed" ? atTime(addDays(todayStr, Math.min(-1, dueOffset)), "17:30").toISOString() : null;
    if (completedAt) activity.push({ id: `${id}-a4`, at: completedAt, actorId: createdById, message: "marked the task Completed" });
    return {
      id, title, description, assigneeId, createdById, priority, status, createdAt, completedAt, activity,
      departmentId: deptOf.get(assigneeId) ?? "DEP-DEV",
      dueDate: addDays(todayStr, dueOffset),
    };
  });
}
