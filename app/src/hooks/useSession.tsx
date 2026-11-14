import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, employeeService, http, settingsService, type AuthSession } from "../services";
import type { AppSettings, Employee, Permission, Role, Scope } from "../types";
import { setDateFormat } from "../utils/date";
import { dataScope, hasPermission } from "../utils/permissions";
import { useQuery } from "./useQuery";

/**
 * The signed-in user. Permissions here only shape the UI; the API enforces them on every request.
 */
interface Session {
  user: Employee;
  role: Role;
  scope: Scope;
  settings: AppSettings;
  can: (p: Permission) => boolean;
  signOut: () => Promise<void>;
  /** Clears the local session without calling the API (e.g. after a password change revoked it). */
  endSession: () => void;
}

const SessionContext = createContext<Session | null>(null);

type Auth = { state: "loading" } | { state: "signedOut" } | { state: "signedIn"; session: AuthSession };

export function SessionProvider({ children, fallback, login }: { children: ReactNode; fallback: ReactNode; login: (onSignedIn: (s: AuthSession) => void) => ReactNode }) {
  const [auth, setAuth] = useState<Auth>({ state: "loading" });

  useEffect(() => {
    http.onUnauthenticated(() => {
      http.setToken(null);
      setAuth({ state: "signedOut" });
    });
    authService.refresh().then(
      (session) => setAuth({ state: "signedIn", session }),
      () => setAuth({ state: "signedOut" }),
    );
  }, []);

  const onSignedIn = useCallback((session: AuthSession) => setAuth({ state: "signedIn", session }), []);
  const endSession = useCallback(() => {
    http.setToken(null);
    setAuth({ state: "signedOut" });
  }, []);

  if (auth.state === "loading") return <>{fallback}</>;
  if (auth.state === "signedOut") return <>{login(onSignedIn)}</>;
  return <SignedIn key={auth.session.user.id} initial={auth.session} endSession={endSession}>{children}</SignedIn>;
}

function SignedIn({ initial, endSession, children }: { initial: AuthSession; endSession: () => void; children: ReactNode }) {
  // Re-read after any change so edits to your own profile, role permissions or settings show up immediately.
  const user = useQuery(() => employeeService.get(initial.user.id), [initial.user.id]).data ?? initial.user;
  const perms = useQuery(() => settingsService.rolePermissions(), []).data ?? initial.permissions;
  const settings = useQuery(() => settingsService.get(), []).data ?? initial.settings;

  const value = useMemo<Session>(() => {
    setDateFormat(settings.dateFormat);
    return {
      user,
      role: user.role,
      scope: dataScope(user),
      settings,
      can: (p) => hasPermission(perms, user.role, p),
      signOut: () => authService.logout().finally(endSession),
      endSession,
    };
  }, [user, perms, settings, endSession]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const s = useContext(SessionContext);
  if (!s) throw new Error("useSession must be used inside SessionProvider");
  return s;
}
