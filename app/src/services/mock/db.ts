import { createSeed, type MockDatabase } from "../../mock-data";
import type { Activity, AppNotification, ID, Scope } from "../../types";
import { today } from "../../utils/date";
import { hasPermission } from "../../utils/permissions";
import { uid } from "../../utils/format";

const STORAGE_KEY = "wfh-mock-db-v1";

/** Thrown for expected failures (validation, not found). The message is shown to the user. */
export class ServiceError extends Error {}

interface Stored {
  seededOn: string;
  data: MockDatabase;
}

// shortcut: localStorage persistence, reseeded daily so "today" data stays coherent. Removed once real API exists.
function load(): MockDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as Stored;
      if (stored.seededOn === today()) return stored.data;
    }
  } catch {
    // corrupt or unavailable storage: fall through to a fresh seed
  }
  return createSeed();
}

export let db: MockDatabase = load();

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ seededOn: today(), data: db } satisfies Stored));
  } catch {
    // storage full / blocked: keep working in memory
  }
}

export function reset() {
  db = createSeed();
  save();
}

/** Simulated network latency so loading states are visible. Returns a deep copy, like a real API would. */
export async function respond<T>(value: T, ms = 250): Promise<T> {
  await new Promise((r) => setTimeout(r, ms + Math.random() * 150));
  return value === undefined ? value : structuredClone(value);
}

export function findOr404<T extends { id: ID }>(list: T[], id: ID, label: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new ServiceError(`${label} not found`);
  return item;
}

export function employeeMatches(scope: Scope | undefined, employeeId: ID): boolean {
  if (!scope) return true;
  if (scope.employeeId && scope.employeeId !== employeeId) return false;
  if (scope.departmentId) {
    return db.employees.find((e) => e.id === employeeId)?.departmentId === scope.departmentId;
  }
  return true;
}

export function notify(n: Omit<AppNotification, "id" | "createdAt" | "read">) {
  db.notifications.unshift({ ...n, id: uid("NTF"), createdAt: new Date().toISOString(), read: false });
}

export function logActivity(actorId: ID, kind: Activity["kind"], message: string) {
  db.activities.unshift({ id: uid("ACT"), at: new Date().toISOString(), actorId, kind, message });
  db.activities.length = Math.min(db.activities.length, 200);
}

/** Everyone who could approve this employee's leave: org-level approvers plus their department head. */
export function approversFor(employeeId: ID): ID[] {
  const emp = db.employees.find((e) => e.id === employeeId);
  return db.employees
    .filter((e) => e.id !== employeeId && e.status !== "inactive" && hasPermission(db.rolePermissions, e.role, "leaves.approve"))
    .filter((e) => e.role !== "department_head" || e.departmentId === emp?.departmentId)
    .map((e) => e.id);
}

export const nameOf = (id: ID) => {
  const e = db.employees.find((x) => x.id === id);
  return e ? `${e.firstName} ${e.lastName}` : "Unknown";
};
