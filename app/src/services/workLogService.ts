import type { WorkLogService } from "./contracts";
import { http } from "./http";
import type { WorkLog } from "../types";

export const workLogService: WorkLogService = {
  list: (q) => http.get<WorkLog[]>("/worklogs", { ...q }),
  save: (input) => http.put<WorkLog>("/worklogs", input),
  remove: (id) => http.delete(`/worklogs/${encodeURIComponent(id)}`),
};
