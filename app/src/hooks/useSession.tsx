import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { demoUsers } from "../mock-data";
import { employeeService, settingsService } from "../services";
import type { AppSettings, Employee, Permission, Role, RolePermissions, Scope } from "../types";
import { setDateFormat } from "../utils/date";
import { dataScope, hasPermission } from "../utils/permissions";
import { useQuery } from "./useQuery";

/**
 * Frontend-only "session": which demo user you're viewing the app as.
 * This is NOT security — it only shapes navigation and visibility. Real auth/authorisation lives in the backend.
 */
interface Session {
  user: Employee;
  role: Role;
  scope: Scope;
  settings: AppSettings;
  can: (p: Permission) => boolean;
  switchRole: (role: Role) => void;
}

const SessionContext = createContext<Session | null>(null);
const ROLE_KEY = "wfh-demo-role";

function initialRole(): Role {
  try {
    const r = localStorage.getItem(ROLE_KEY) as Role | null;
    if (r && r in demoUsers) return r;
  } catch {
    // storage unavailable
  }
  return "super_admin";
}

export function SessionProvider({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const [role, setRole] = useState<Role>(initialRole);
  // Fetch user and role together and keep the previous pair while switching,
  // so the app never renders a role with the wrong user (and never blanks out).
  const active = useQuery(() => employeeService.get(demoUsers[role]).then((u) => ({ user: u, role })), [role], { keepPrevious: true });
  const perms = useQuery<RolePermissions>(() => settingsService.rolePermissions(), []);
  const settings = useQuery(() => settingsService.get(), []);

  useEffect(() => {
    try {
      localStorage.setItem(ROLE_KEY, role);
    } catch {
      // storage unavailable
    }
  }, [role]);

  const switchRole = useCallback((r: Role) => setRole(r), []);

  const value = useMemo<Session | null>(() => {
    if (!active.data || !perms.data || !settings.data) return null;
    const map = perms.data;
    const { user, role: activeRole } = active.data;
    setDateFormat(settings.data.dateFormat);
    // The switcher's role wins even if an admin later edits the demo user's role.
    return {
      user,
      role: activeRole,
      scope: dataScope({ ...user, role: activeRole }),
      settings: settings.data,
      can: (p) => hasPermission(map, activeRole, p),
      switchRole,
    };
  }, [active.data, perms.data, settings.data, switchRole]);

  if (!value) return <>{fallback}</>;
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
