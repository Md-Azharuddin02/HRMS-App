import type { ActivityService } from "./contracts";
import { db, employeeMatches, respond } from "./mock/db";

export const activityService: ActivityService = {
  async list(limit, scope) {
    return respond(db.activities.filter((a) => a.actorId === "system" ? !scope?.employeeId : employeeMatches(scope, a.actorId)).slice(0, limit));
  },
};
