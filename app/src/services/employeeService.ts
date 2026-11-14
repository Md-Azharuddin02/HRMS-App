import type { EmployeeService } from "./contracts";
import { http } from "./http";
import type { Employee } from "../types";

export const employeeService: EmployeeService = {
  list: (scope) => http.get<Employee[]>("/employees", { departmentId: scope?.departmentId }),
  get: (id) => http.get<Employee>(`/employees/${encodeURIComponent(id)}`),
  create: (input) => http.post<Employee>("/employees", input),
  update: (id, patch) => http.patch<Employee>(`/employees/${encodeURIComponent(id)}`, patch),
  remove: (id) => http.delete(`/employees/${encodeURIComponent(id)}`),
};
