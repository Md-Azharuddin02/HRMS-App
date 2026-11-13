import type {
  Activity, AppNotification, AppSettings, AttendanceRecord, Department, Employee, LeaveRequest, RolePermissions, Task, WorkLog,
} from "../types";
import { toDateString } from "../utils/date";
import { buildAttendance } from "./attendance";
import { buildActivities, buildNotifications } from "./feed";
import { buildLeaves } from "./leaves";
import { demoUsers, departments, employees, rolePermissions, settings } from "./organisation";
import { buildTasks } from "./tasks";
import { buildWorkLogs } from "./workLogs";

export { demoUsers };

export interface MockDatabase {
  employees: Employee[];
  departments: Department[];
  attendance: AttendanceRecord[];
  tasks: Task[];
  workLogs: WorkLog[];
  leaves: LeaveRequest[];
  notifications: AppNotification[];
  activities: Activity[];
  settings: AppSettings;
  rolePermissions: RolePermissions;
}

/** Fresh copy of all mock data, with dates positioned relative to `now`. */
export function createSeed(now: Date = new Date()): MockDatabase {
  const todayStr = toDateString(now);
  const s = structuredClone(settings);
  const emps = structuredClone(employees);
  const leaves = buildLeaves(todayStr, s.weekendDays);
  const tasks = buildTasks(emps, todayStr);
  const attendance = buildAttendance(emps, leaves, s, now, todayStr, Object.values(demoUsers));
  return {
    employees: emps,
    departments: structuredClone(departments),
    attendance,
    tasks,
    workLogs: buildWorkLogs(emps, attendance, todayStr),
    leaves,
    notifications: buildNotifications(tasks, leaves, emps, todayStr, now),
    activities: buildActivities(now),
    settings: s,
    rolePermissions: structuredClone(rolePermissions),
  };
}
