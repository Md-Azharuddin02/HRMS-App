import type { AttendanceService } from "./contracts";
import { http } from "./http";
import type { AttendanceRecord } from "../types";

export const attendanceService: AttendanceService = {
  getToday: () => http.get<AttendanceRecord | null>("/attendance/today"),
  list: (q) => http.get<AttendanceRecord[]>("/attendance", { ...q }),
  checkIn: () => http.post<AttendanceRecord>("/attendance/check-in"),
  checkOut: () => http.post<AttendanceRecord>("/attendance/check-out"),
  startBreak: () => http.post<AttendanceRecord>("/attendance/breaks/start"),
  endBreak: () => http.post<AttendanceRecord>("/attendance/breaks/end"),
};
