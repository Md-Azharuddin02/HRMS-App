// Service contracts. The UI only depends on these interfaces — swap the mock
// implementations in this folder for real API calls without touching components.
import type {
  Activity, AppNotification, AppSettings, AttendanceRecord, AttendanceTrendPoint, DashboardSummary, DateRange,
  Department, DepartmentInput, DepartmentStat, Employee, EmployeeInput, ID, LeaveBalance, LeaveInput, LeaveRequest,
  LeaveStatus, Report, RolePermissions, Scope, Task, TaskInput, TaskStatus, WorkLog, WorkLogInput,
} from "../types";

export interface EmployeeService {
  list(scope?: Scope): Promise<Employee[]>;
  get(id: ID): Promise<Employee>;
  create(input: EmployeeInput): Promise<Employee>;
  update(id: ID, patch: Partial<EmployeeInput>): Promise<Employee>;
  remove(id: ID): Promise<void>;
}

export interface DepartmentService {
  list(): Promise<Department[]>;
  get(id: ID): Promise<Department>;
  create(input: DepartmentInput): Promise<Department>;
  update(id: ID, patch: Partial<DepartmentInput>): Promise<Department>;
  remove(id: ID): Promise<void>;
}

export interface AttendanceService {
  getToday(employeeId: ID): Promise<AttendanceRecord | null>;
  list(params: Scope & Partial<DateRange>): Promise<AttendanceRecord[]>;
  checkIn(employeeId: ID): Promise<AttendanceRecord>;
  checkOut(employeeId: ID): Promise<AttendanceRecord>;
  startBreak(employeeId: ID): Promise<AttendanceRecord>;
  endBreak(employeeId: ID): Promise<AttendanceRecord>;
}

export interface TaskService {
  list(scope?: Scope): Promise<Task[]>;
  get(id: ID): Promise<Task>;
  create(input: TaskInput, actorId: ID): Promise<Task>;
  update(id: ID, patch: Partial<TaskInput>, actorId: ID): Promise<Task>;
  setStatus(id: ID, status: TaskStatus, actorId: ID): Promise<Task>;
  comment(id: ID, message: string, actorId: ID): Promise<Task>;
  remove(id: ID): Promise<void>;
}

export interface WorkLogService {
  list(params: Scope & Partial<DateRange>): Promise<WorkLog[]>;
  save(input: WorkLogInput): Promise<WorkLog>;
  remove(id: ID): Promise<void>;
}

export interface LeaveService {
  list(scope?: Scope): Promise<LeaveRequest[]>;
  balances(employeeId: ID): Promise<LeaveBalance[]>;
  apply(input: LeaveInput): Promise<LeaveRequest>;
  review(id: ID, decision: Exclude<LeaveStatus, "pending">, reviewerId: ID, note: string): Promise<LeaveRequest>;
  cancel(id: ID): Promise<void>;
}

export interface NotificationService {
  list(recipientId: ID): Promise<AppNotification[]>;
  markRead(id: ID): Promise<void>;
  markAllRead(recipientId: ID): Promise<void>;
  remove(id: ID): Promise<void>;
}

export interface ReportService {
  dashboard(scope: Scope): Promise<DashboardSummary>;
  departmentStats(): Promise<DepartmentStat[]>;
  attendanceTrend(range: DateRange, scope: Scope): Promise<AttendanceTrendPoint[]>;
  report(range: DateRange, scope: Scope): Promise<Report>;
}

export interface ActivityService {
  list(limit: number, scope?: Scope): Promise<Activity[]>;
}

export interface SettingsService {
  get(): Promise<AppSettings>;
  update(patch: Partial<AppSettings>): Promise<AppSettings>;
  rolePermissions(): Promise<RolePermissions>;
  updateRolePermissions(map: RolePermissions): Promise<RolePermissions>;
  resetDemoData(): Promise<void>;
}
