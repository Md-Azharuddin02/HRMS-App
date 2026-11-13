// Single import point for data access. To connect the real backend, replace each
// implementation with one that calls your API and keeps the same contract (see ./contracts).
export { employeeService } from "./employeeService";
export { departmentService } from "./departmentService";
export { attendanceService } from "./attendanceService";
export { taskService } from "./taskService";
export { workLogService } from "./workLogService";
export { leaveService } from "./leaveService";
export { notificationService } from "./notificationService";
export { reportService } from "./reportService";
export { activityService } from "./activityService";
export { settingsService } from "./settingsService";
export { ServiceError } from "./mock/db";
export type * from "./contracts";
