import type { TaskService } from "./contracts";
import { http } from "./http";
import type { Task } from "../types";

const path = (id: string) => `/tasks/${encodeURIComponent(id)}`;

export const taskService: TaskService = {
  list: (scope) => http.get<Task[]>("/tasks", { ...scope }),
  get: (id) => http.get<Task>(path(id)),
  create: (input) => http.post<Task>("/tasks", input),
  update: (id, patch) => http.patch<Task>(path(id), patch),
  setStatus: (id, status) => http.patch<Task>(path(id), { status }),
  comment: (id, message) => http.post<Task>(`${path(id)}/comments`, { message }),
  remove: (id) => http.delete(path(id)),
};
