import type { Employee, Permission, Role, RolePermissions, Scope } from "../types";

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  department_head: "Department Head",
  hr: "HR",
  employee: "Employee",
};

export const ROLES: Role[] = ["super_admin", "admin", "department_head", "hr", "employee"];

export const PERMISSION_LABELS: Record<Permission, { label: string; group: string }> = {
  "dashboard.org": { label: "View organisation dashboard", group: "Dashboard" },
  "employees.view": { label: "View employee directory", group: "Employees" },
  "employees.manage": { label: "Create, edit and remove employees", group: "Employees" },
  "departments.manage": { label: "Create and edit departments", group: "Departments" },
  "attendance.viewAll": { label: "View team attendance", group: "Attendance" },
  "worklogs.viewAll": { label: "View team work logs", group: "Work logs" },
  "tasks.create": { label: "Create and assign tasks", group: "Tasks" },
  "tasks.viewAll": { label: "View team tasks", group: "Tasks" },
  "leaves.approve": { label: "Approve or reject leave", group: "Leave" },
  "reports.view": { label: "View reports", group: "Reports" },
  "admin.access": { label: "Open admin panel", group: "Admin" },
  "roles.manage": { label: "Manage roles and permissions", group: "Admin" },
  "settings.manage": { label: "Change application settings", group: "Admin" },
};

/** Permissions the UI never lets you strip, so nobody locks themselves out of the admin panel. */
export const LOCKED: Partial<Record<Role, Permission[]>> = {
  super_admin: ["admin.access", "roles.manage", "settings.manage"],
};

export function hasPermission(map: RolePermissions, role: Role, p: Permission): boolean {
  return map[role]?.includes(p) ?? false;
}

/**
 * Which slice of data a user may see. Org-wide roles get an empty scope;
 * department heads are limited to their department, employees to themselves.
 * UI-only visibility — real enforcement belongs in the backend.
 */
export function dataScope(user: Employee): Scope {
  if (user.role === "department_head") return { departmentId: user.departmentId };
  if (user.role === "employee") return { employeeId: user.id };
  return {};
}

export function inScope(scope: Scope, item: { employeeId?: string; departmentId?: string }, employeeDept?: string): boolean {
  if (scope.employeeId && item.employeeId !== scope.employeeId) return false;
  if (scope.departmentId && (item.departmentId ?? employeeDept) !== scope.departmentId) return false;
  return true;
}
