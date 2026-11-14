import type { LeaveService } from "./contracts";
import { http } from "./http";
import type { LeaveBalance, LeaveRequest } from "../types";

export const leaveService: LeaveService = {
  list: (scope) => http.get<LeaveRequest[]>("/leaves", { ...scope }),
  balances: (employeeId) => http.get<LeaveBalance[]>("/leaves/balances", { employeeId }),
  apply: (input) => http.post<LeaveRequest>("/leaves", input),
  review: (id, decision, note) => http.post<LeaveRequest>(`/leaves/${encodeURIComponent(id)}/review`, { decision, note }),
  cancel: (id) => http.delete(`/leaves/${encodeURIComponent(id)}`),
};
