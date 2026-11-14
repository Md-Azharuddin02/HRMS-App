// Central domain types. Shapes match the HRMS API (HRMS-APIs/app/schemas.py).

export type ID = string;
export type DateFormat = "dd MMM yyyy" | "yyyy-MM-dd" | "dd/MM/yyyy";
/** ISO date `YYYY-MM-DD` */
export type DateString = string;
/** Full ISO timestamp */
export type DateTimeString = string;

export type Role = "super_admin" | "admin" | "department_head" | "hr" | "employee";

export type Permission =
  | "dashboard.org"
  | "employees.view"
  | "employees.manage"
  | "departments.manage"
  | "attendance.viewAll"
  | "worklogs.viewAll"
  | "tasks.create"
  | "tasks.viewAll"
  | "leaves.approve"
  | "reports.view"
  | "admin.access"
  | "roles.manage"
  | "settings.manage";

export type RolePermissions = Record<Role, Permission[]>;

export type EmploymentStatus = "active" | "probation" | "on_leave" | "inactive";

export interface Employee {
  id: ID; // e.g. EMP-001
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: ID;
  designation: string;
  joiningDate: DateString;
  status: EmploymentStatus;
  role: Role;
  location: string;
}

export interface Department {
  id: ID;
  name: string;
  code: string;
  description: string;
  headId: ID | null;
  color: string; // hex, used for charts / chips
}

export type AttendanceStatus = "present" | "late" | "absent" | "on_leave" | "half_day";

export interface BreakPeriod {
  start: DateTimeString;
  end: DateTimeString | null;
}

export interface AttendanceRecord {
  id: ID;
  employeeId: ID;
  date: DateString;
  checkIn: DateTimeString | null;
  checkOut: DateTimeString | null;
  breaks: BreakPeriod[];
  status: AttendanceStatus;
}

export type TaskPriority = "low" | "medium" | "high" | "critical";
export type TaskStatus = "todo" | "in_progress" | "review" | "completed";

export interface TaskActivity {
  id: ID;
  at: DateTimeString;
  actorId: ID;
  message: string;
}

export interface Task {
  id: ID;
  title: string;
  description: string;
  assigneeId: ID;
  departmentId: ID;
  createdById: ID;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: DateString;
  createdAt: DateTimeString;
  completedAt: DateTimeString | null;
  activity: TaskActivity[];
}

export interface WorkLog {
  id: ID;
  employeeId: ID;
  date: DateString;
  hours: number;
  completed: string[];
  ongoing: string[];
  blockers: string;
  remarks: string;
  submittedAt: DateTimeString;
}

export type LeaveType = "casual" | "sick" | "earned" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "rejected";

export interface LeaveRequest {
  id: ID;
  employeeId: ID;
  type: LeaveType;
  startDate: DateString;
  endDate: DateString;
  days: number;
  reason: string;
  status: LeaveStatus;
  appliedAt: DateTimeString;
  reviewedById: ID | null;
  reviewedAt: DateTimeString | null;
  reviewNote: string;
}

export interface LeaveBalance {
  type: LeaveType;
  allowance: number | null; // null = unlimited (unpaid)
  used: number;
  pending: number;
}

export type NotificationType =
  | "task_assigned"
  | "task_overdue"
  | "leave_applied"
  | "leave_approved"
  | "leave_rejected"
  | "system";

export interface AppNotification {
  id: ID;
  recipientId: ID;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  createdAt: DateTimeString;
  read: boolean;
}

export interface Activity {
  id: ID;
  at: DateTimeString;
  actorId: ID;
  message: string;
  kind: "task" | "attendance" | "leave" | "worklog" | "employee" | "system";
}

export interface AppSettings {
  companyName: string;
  workStartTime: string; // HH:mm
  workEndTime: string; // HH:mm
  lateGraceMinutes: number;
  standardHours: number;
  weekendDays: number[]; // 0 = Sunday
  leaveAllowances: Record<Exclude<LeaveType, "unpaid">, number>;
  timezone: string;
  dateFormat: DateFormat;
  apiBaseUrl: string;
  emailNotifications: boolean;
}

// ---- Query / report shapes ----

export interface Scope {
  departmentId?: ID;
  employeeId?: ID;
}

export interface DateRange {
  from: DateString;
  to: DateString;
}

export interface DashboardSummary {
  totalEmployees: number;
  present: number;
  absent: number;
  onLeave: number;
  working: number;
  onBreak: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface DepartmentStat {
  departmentId: ID;
  name: string;
  color: string;
  employees: number;
  present: number;
  openTasks: number;
  completedTasks: number;
}

export interface AttendanceTrendPoint {
  date: DateString;
  present: number;
  late: number;
  absent: number;
  onLeave: number;
}

export interface EmployeeReportRow {
  employeeId: ID;
  name: string;
  departmentId: ID;
  presentDays: number;
  lateDays: number;
  absentDays: number;
  leaveDays: number;
  totalHours: number;
  avgHours: number;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number; // 0-100
}

export interface DepartmentReportRow {
  departmentId: ID;
  name: string;
  headcount: number;
  attendanceRate: number; // 0-100
  totalHours: number;
  tasksAssigned: number;
  tasksCompleted: number;
  completionRate: number;
}

export interface Report {
  range: DateRange;
  workingDays: number;
  employees: EmployeeReportRow[];
  departments: DepartmentReportRow[];
  trend: AttendanceTrendPoint[];
}

// ---- Input shapes for mutations ----

export type EmployeeInput = Omit<Employee, "id">;
export type DepartmentInput = Omit<Department, "id">;
export type TaskInput = Pick<
  Task,
  "title" | "description" | "assigneeId" | "departmentId" | "priority" | "status" | "dueDate"
>;
export type WorkLogInput = Omit<WorkLog, "id" | "employeeId" | "submittedAt">;
export type LeaveInput = Pick<LeaveRequest, "type" | "startDate" | "endDate" | "reason">;
