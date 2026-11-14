// Single import point for data access. Every service calls the HRMS REST API through ./http.
export { authService } from "./authService";
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
export { ServiceError, http } from "./http";
export type * from "./contracts";
