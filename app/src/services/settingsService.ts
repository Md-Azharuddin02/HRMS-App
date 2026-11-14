import type { SettingsService } from "./contracts";
import { http } from "./http";
import type { AppSettings, RolePermissions } from "../types";

export const settingsService: SettingsService = {
  get: () => http.get<AppSettings>("/settings"),
  update: (patch) => http.patch<AppSettings>("/settings", patch),
  rolePermissions: () => http.get<RolePermissions>("/roles/permissions"),
  updateRolePermissions: (map) => http.put<RolePermissions>("/roles/permissions", map),
};
