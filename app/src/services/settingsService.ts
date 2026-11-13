import type { SettingsService } from "./contracts";
import { ServiceError, db, reset, respond, save } from "./mock/db";
import { LOCKED } from "../utils/permissions";
import type { Role } from "../types";

const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

export const settingsService: SettingsService = {
  async get() {
    return respond(db.settings, 150);
  },

  async update(patch) {
    const next = { ...db.settings, ...patch };
    if (!HHMM.test(next.workStartTime) || !HHMM.test(next.workEndTime)) throw new ServiceError("Times must be in HH:mm format");
    if (next.workEndTime <= next.workStartTime) throw new ServiceError("Work end time must be after start time");
    if (next.standardHours <= 0 || next.standardHours > 24) throw new ServiceError("Standard hours must be between 1 and 24");
    if (next.lateGraceMinutes < 0 || next.lateGraceMinutes > 240) throw new ServiceError("Grace period must be 0–240 minutes");
    if (!next.companyName.trim()) throw new ServiceError("Company name is required");
    db.settings = next;
    save();
    return respond(next);
  },

  async rolePermissions() {
    return respond(db.rolePermissions, 150);
  },

  async updateRolePermissions(map) {
    for (const [role, locked] of Object.entries(LOCKED) as [Role, string[]][]) {
      if (locked.some((p) => !map[role].includes(p as never))) throw new ServiceError("Super Admin must keep admin and settings access");
    }
    db.rolePermissions = map;
    save();
    return respond(map);
  },

  async resetDemoData() {
    reset();
    return respond(undefined);
  },
};
