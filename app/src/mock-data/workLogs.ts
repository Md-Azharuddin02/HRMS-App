import type { AttendanceRecord, Employee, WorkLog } from "../types";
import { addDays, atTime } from "../utils/date";
import { random } from "./random";

const pool: Record<string, { done: string[]; ongoing: string[]; blockers: string[] }> = {
  "DEP-DEV": {
    done: ["Merged PR for table sorting", "Fixed token refresh race condition", "Code review for 3 PRs", "Wrote API contract for exports", "Resolved 2 production bugs", "Added unit tests for date utils"],
    ongoing: ["Auth screens migration", "Dashboard query optimisation", "Rate limiting middleware", "Notification service refactor"],
    blockers: ["Waiting on staging DB access", "Design for empty states not final", "API spec pending review"],
  },
  "DEP-QA": {
    done: ["Executed 42 regression cases", "Logged 5 new defects", "Automated login smoke test", "Verified sprint fixes", "Updated test data set"],
    ongoing: ["Release 4.2 regression", "Checkout automation", "Attendance test plan"],
    blockers: ["Staging build broken since morning", "Test accounts expired"],
  },
  "DEP-DES": {
    done: ["Finalised report empty states", "Ran 2 usability sessions", "Exported icon set v2", "Updated component specs"],
    ongoing: ["Brand guidelines v2", "Mobile navigation prototype", "Task board research synthesis"],
    blockers: ["Waiting on copy from marketing"],
  },
  "DEP-MKT": {
    done: ["Published 2 blog posts", "Fixed 12 crawl errors", "Launched retargeting campaign", "Sent webinar reminder emails"],
    ongoing: ["Q4 landing page copy", "Keyword clustering", "Monthly performance report"],
    blockers: ["Ad account pending verification"],
  },
  "DEP-HR": {
    done: ["Screened 18 applications", "Scheduled 4 interviews", "Updated onboarding checklist", "Processed attendance corrections"],
    ongoing: ["QA role hiring", "Leave policy update", "Offsite planning"],
    blockers: [],
  },
};

const pick = <T,>(arr: T[], n: number, rand: () => number) => [...arr].sort(() => rand() - 0.5).slice(0, n);

/** Logs for most worked days in the last 10 days. Today is left empty so it can be submitted from the UI. */
export function buildWorkLogs(employees: Employee[], attendance: AttendanceRecord[], todayStr: string): WorkLog[] {
  const rand = random(7);
  const from = addDays(todayStr, -14);
  const deptOf = new Map(employees.map((e) => [e.id, e.departmentId]));
  return attendance
    .filter((a) => a.date >= from && a.date < todayStr && a.checkIn && a.checkOut && rand() < 0.75)
    .map((a) => {
      const p = pool[deptOf.get(a.employeeId) ?? "DEP-DEV"];
      const hours = (new Date(a.checkOut!).getTime() - new Date(a.checkIn!).getTime()) / 3_600_000 - 0.75;
      return {
        id: `WL-${a.employeeId}-${a.date}`,
        employeeId: a.employeeId,
        date: a.date,
        hours: Math.round(hours * 4) / 4,
        completed: pick(p.done, 2 + Math.floor(rand() * 2), rand),
        ongoing: pick(p.ongoing, 1 + Math.floor(rand() * 2), rand),
        blockers: p.blockers.length && rand() < 0.25 ? pick(p.blockers, 1, rand)[0] : "",
        remarks: rand() < 0.3 ? "On track for sprint goals." : "",
        submittedAt: atTime(a.date, "18:45").toISOString(),
      };
    });
}
