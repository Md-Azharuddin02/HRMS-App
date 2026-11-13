import {
  BarChart3, Bell, Building2, CalendarDays, CheckSquare, ClipboardList, Clock, LayoutDashboard, Settings, Users, type LucideIcon,
} from "lucide-react";
import type { Permission, Role } from "../types";

export interface NavItem {
  to: string;
  label: string;
  /** Label override for roles that only see their own data. */
  selfLabel?: string;
  icon: LucideIcon;
  permission?: Permission;
  section: "Workspace" | "People" | "Insights" | "System";
}

export const NAV: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, section: "Workspace" },
  { to: "/attendance", label: "Attendance", selfLabel: "My Attendance", icon: Clock, section: "Workspace" },
  { to: "/work-logs", label: "Work Logs", selfLabel: "My Work Logs", icon: ClipboardList, section: "Workspace" },
  { to: "/tasks", label: "Tasks", selfLabel: "My Tasks", icon: CheckSquare, section: "Workspace" },
  { to: "/leave", label: "Leave", selfLabel: "My Leave", icon: CalendarDays, section: "Workspace" },
  { to: "/employees", label: "Employees", icon: Users, permission: "employees.view", section: "People" },
  { to: "/departments", label: "Departments", icon: Building2, section: "People" },
  { to: "/reports", label: "Reports", icon: BarChart3, permission: "reports.view", section: "Insights" },
  { to: "/notifications", label: "Notifications", icon: Bell, section: "Insights" },
  { to: "/admin", label: "Admin Panel", icon: Settings, permission: "admin.access", section: "System" },
];

/** Roles that only see their own records get personal labels ("My Tasks"). */
export const isSelfOnly = (role: Role) => role === "employee";
