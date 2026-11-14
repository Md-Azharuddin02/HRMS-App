import type { DepartmentService } from "./contracts";
import { http } from "./http";
import type { Department } from "../types";

export const departmentService: DepartmentService = {
  list: () => http.get<Department[]>("/departments"),
  get: (id) => http.get<Department>(`/departments/${encodeURIComponent(id)}`),
  create: (input) => http.post<Department>("/departments", input),
  update: (id, patch) => http.patch<Department>(`/departments/${encodeURIComponent(id)}`, patch),
  remove: (id) => http.delete(`/departments/${encodeURIComponent(id)}`),
};
