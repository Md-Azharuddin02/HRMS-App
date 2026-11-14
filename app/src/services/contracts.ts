// Service contracts. The UI only depends on these interfaces; the implementations call the HRMS REST API.
// The server decides who the caller is (from the access token) and what they may see, so there are no
// "actor" parameters here and any scope passed in can only narrow results, never widen them.
import type {
  Activity, AppNotification, AppSettings, AttendanceRecord, AttendanceTrendPoint, DashboardSummary, DateRange,
  Department, DepartmentInput, DepartmentStat, Employee, EmployeeInput, ID, LeaveBalance, LeaveInput, LeaveRequest,
  LeaveStatus, Report, RolePermissions, Scope, Task, TaskInput, TaskStatus, WorkLog, WorkLogInput,
} from "../types";

export interface AuthSession {
  accessToken: string;
  user: Employee;
  permissions: RolePermissions;
  settings: AppSettings;
}

export interface AuthService {
  login(email: string, password: string): Promise<AuthSession>;
  /** Renews the session from the refresh cookie. Rejects when signed out. */
  refresh(): Promise<AuthSession>;
  logout(): Promise<void>;
  /** Signs the user out of every device; they must sign in again afterwards. */
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
}

export interface EmployeeService {
  list(scope?: Scope): Promise<Employee[]>;
  get(id: ID): Promise<Employee>;
  create(input: EmployeeInput & { password: string }): Promise<Employee>;
  /** `password` resets the employee's password. */
  update(id: ID, patch: Partial<EmployeeInput> & { password?: string }): Promise<Employee>;
  remove(id: ID): Promise<void>;
}

export interface DepartmentService {
  list(): Promise<Department[]>;
  get(id: ID): Promise<Department>;
  create(input: DepartmentInput): Promise<Department>;
  update(id: ID, patch: Partial<DepartmentInput>): Promise<Department>;
  remove(id: ID): Promise<void>;
}

/** Clock actions always apply to the signed-in user. */
export interface AttendanceService {
  getToday(): Promise<AttendanceRecord | null>;
  list(params: Scope & Partial<DateRange>): Promise<AttendanceRecord[]>;
  checkIn(): Promise<AttendanceRecord>;
  checkOut(): Promise<AttendanceRecord>;
  startBreak(): Promise<AttendanceRecord>;
  endBreak(): Promise<AttendanceRecord>;
}

export interface TaskService {
  list(scope?: Scope): Promise<Task[]>;
  get(id: ID): Promise<Task>;
  create(input: TaskInput): Promise<Task>;
  update(id: ID, patch: Partial<TaskInput>): Promise<Task>;
  setStatus(id: ID, status: TaskStatus): Promise<Task>;
  comment(id: ID, message: string): Promise<Task>;
  remove(id: ID): Promise<void>;
}

export interface WorkLogService {
  list(params: Scope & Partial<DateRange>): Promise<WorkLog[]>;
  /** One log per day for the signed-in user: saving the same date again replaces it. */
  save(input: WorkLogInput): Promise<WorkLog>;
  remove(id: ID): Promise<void>;
}

export interface LeaveService {
  list(scope?: Scope): Promise<LeaveRequest[]>;
  /** Defaults to the signed-in user. */
  balances(employeeId?: ID): Promise<LeaveBalance[]>;
  apply(input: LeaveInput): Promise<LeaveRequest>;
  review(id: ID, decision: Exclude<LeaveStatus, "pending">, note: string): Promise<LeaveRequest>;
  cancel(id: ID): Promise<void>;
}

/** Always the signed-in user's notifications. */
export interface NotificationService {
  list(): Promise<AppNotification[]>;
  markRead(id: ID): Promise<void>;
  markAllRead(): Promise<void>;
  remove(id: ID): Promise<void>;
}

export interface ReportService {
  dashboard(scope: Scope): Promise<DashboardSummary>;
  departmentStats(): Promise<DepartmentStat[]>;
  attendanceTrend(range: DateRange, scope: Scope): Promise<AttendanceTrendPoint[]>;
  report(range: DateRange, scope: Scope): Promise<Report>;
}

/** Recent activity the signed-in user may see (their department, or just themselves). */
export interface ActivityService {
  list(limit: number): Promise<Activity[]>;
}

export interface SettingsService {
  get(): Promise<AppSettings>;
  update(patch: Partial<AppSettings>): Promise<AppSettings>;
  rolePermissions(): Promise<RolePermissions>;
  updateRolePermissions(map: RolePermissions): Promise<RolePermissions>;
}
