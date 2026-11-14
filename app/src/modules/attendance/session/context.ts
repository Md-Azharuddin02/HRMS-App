import { createContext, useContext } from "react";
import type { AttendanceRecord, SessionState } from "../../../types";

/**
 * The signed-in user's attendance session for today, shared by every screen.
 * Rule: one continuous session per day. CHECK IN starts it, breaks pause it, RESUME WORK only ends a break,
 * CHECK OUT (or the end of the workday, applied by the API) ends it.
 */
export interface AttendanceSession {
  record: AttendanceRecord | null | undefined; // undefined while loading
  state: SessionState;
  error: string | null;
  pending: boolean;
  lastActivity: number;
  reload: () => void;
  checkIn: () => Promise<boolean>;
  startBreak: () => Promise<boolean>;
  resume: () => Promise<boolean>;
  checkOut: () => Promise<boolean>;
}

export const Ctx = createContext<AttendanceSession | null>(null);

export function useAttendanceSession(): AttendanceSession {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAttendanceSession must be used inside AttendanceSessionProvider");
  return v;
}
