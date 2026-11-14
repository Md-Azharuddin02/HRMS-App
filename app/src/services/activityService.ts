import type { ActivityService } from "./contracts";
import { http } from "./http";
import type { Activity } from "../types";

export const activityService: ActivityService = {
  list: (limit) => http.get<Activity[]>("/activities", { limit }),
};
