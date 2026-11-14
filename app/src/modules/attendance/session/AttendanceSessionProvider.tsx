import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useToast } from "../../../components/ui/Toast";
import { useQuery } from "../../../hooks/useQuery";
import { useSession } from "../../../hooks/useSession";
import { attendanceService, ServiceError } from "../../../services";
import { liveState } from "../../../utils/attendance";
import { emitDataChange } from "../../../utils/events";
import { Ctx, type AttendanceSession } from "./context";
import { InactivityWarning } from "./InactivityWarning";
import {
  browserStorage, changedKey, closeTab, heartbeatTab, inactivityStep, markClosed, readActivity, takeClosedBreakStart,
  TAB_HEARTBEAT_MS, writeActivity,
} from "./lifecycle";


const ACTIVITY_EVENTS = ["pointerdown", "pointermove", "keydown", "wheel", "scroll", "touchstart"] as const;
const ACTIVITY_WRITE_MS = 5_000;
const SERVER_HEARTBEAT_MS = 5 * 60_000;
const WATCH_MS = 15_000;
const REFRESH_MS = 60_000;
const newTabId = () => (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);

export function AttendanceSessionProvider({ children }: { children: ReactNode }) {
  const { user, settings } = useSession();
  const toast = useToast();
  const kv = useMemo(browserStorage, []);
  const tabId = useMemo(newTabId, []);
  const q = useQuery(() => attendanceService.getToday(), [user.id]);
  const record = q.data;
  const state = liveState(record);
  const [pending, setPending] = useState(false);
  const [warning, setWarning] = useState(false);
  const [lastActivity, setLastActivity] = useState(() => Math.max(Date.now(), readActivity(kv, user.id) ?? 0));

  // Latest values for event handlers registered once.
  const live = useRef({ record, state, lastActivity, settings });
  live.current = { record, state, lastActivity, settings };
  const autoBreaking = useRef(false);
  const lastServerPing = useRef(0);

  const announce = useCallback(() => {
    emitDataChange(); // this tab
    try {
      kv.setItem(changedKey(user.id), String(Date.now())); // other tabs (storage event)
    } catch {
      // storage blocked: other tabs catch up on their next refresh
    }
  }, [kv, user.id]);

  const touch = useCallback(() => {
    const now = Date.now();
    setLastActivity(now);
    writeActivity(kv, user.id, now);
    setWarning(false);
  }, [kv, user.id]);

  /** Manual actions: toast the outcome. */
  const act = useCallback(
    async (fn: () => Promise<unknown>, success: string) => {
      setPending(true);
      try {
        await fn();
        touch();
        toast.success(success);
        return true;
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Something went wrong");
        return false;
      } finally {
        setPending(false);
        announce();
      }
    },
    [announce, toast, touch],
  );

  /** Automatic breaks: at most one request in flight; a 409 means another tab already did it. */
  const autoBreak = useCallback(
    async (type: "inactivity" | "tab_closed", startedAt: number, message: string) => {
      if (autoBreaking.current) return;
      autoBreaking.current = true;
      try {
        await attendanceService.startBreak({ type, startedAt: new Date(startedAt).toISOString() });
        toast.info(message);
      } catch (e) {
        if (!(e instanceof ServiceError && e.status === 409)) toast.error(e instanceof Error ? e.message : "Couldn't start the break");
      } finally {
        autoBreaking.current = false;
        setWarning(false);
        announce();
      }
    },
    [announce, toast],
  );

  // ---- interaction tracking (shared across tabs through localStorage) ----
  useEffect(() => {
    let lastWrite = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastWrite < ACTIVITY_WRITE_MS) return;
      lastWrite = now;
      touch();
      if (live.current.state === "working" && now - lastServerPing.current > SERVER_HEARTBEAT_MS) {
        lastServerPing.current = now;
        attendanceService.recordActivity().catch(() => {});
      }
    };
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, onActivity, { passive: true, capture: true }));
    return () => ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, onActivity, { capture: true }));
  }, [touch]);

  // ---- inactivity watcher: warn, then move to break ----
  useEffect(() => {
    const check = () => {
      const { state: s, settings: cfg, lastActivity: mine } = live.current;
      if (s !== "working") return setWarning(false);
      const last = Math.max(mine, readActivity(kv, user.id) ?? 0); // activity in another tab counts
      const step = inactivityStep(Date.now() - last, cfg.inactivityWarningMinutes, cfg.inactivityBreakMinutes);
      if (step === "break") {
        // The break began when the limit was crossed, not when we noticed (e.g. after the laptop slept).
        void autoBreak("inactivity", last + cfg.inactivityBreakMinutes * 60_000,
          `No activity for ${cfg.inactivityBreakMinutes} minutes, so you've been moved to a break. Click Resume work when you're back.`);
      } else {
        setWarning(step === "warn");
      }
    };
    check();
    const t = setInterval(check, WATCH_MS);
    const onVisible = () => document.visibilityState === "visible" && check();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [autoBreak, kv, user.id]);

  // ---- tab lifecycle: remember a close while working; never check out on close ----
  useEffect(() => {
    heartbeatTab(kv, tabId, Date.now());
    const beat = setInterval(() => heartbeatTab(kv, tabId, Date.now()), TAB_HEARTBEAT_MS);
    const onHide = () => {
      const { othersOpen } = closeTab(kv, tabId, Date.now());
      const { record: r, state: s } = live.current;
      if (r && s === "working" && !othersOpen) markClosed(kv, user.id, { attendanceId: r.id, at: Date.now() });
    };
    const onShow = () => heartbeatTab(kv, tabId, Date.now()); // restored from back/forward cache
    window.addEventListener("pagehide", onHide);
    window.addEventListener("pageshow", onShow);
    return () => {
      clearInterval(beat);
      window.removeEventListener("pagehide", onHide);
      window.removeEventListener("pageshow", onShow);
      closeTab(kv, tabId, Date.now());
    };
  }, [kv, tabId, user.id]);

  // ---- on (re)open: turn a recorded close into a "tab closed" break ----
  const closedChecked = useRef<string | null>(null);
  useEffect(() => {
    if (!record || closedChecked.current === record.id) return;
    closedChecked.current = record.id;
    const start = takeClosedBreakStart(kv, user.id, record.id, Date.now());
    if (start !== null && liveState(record) === "working") {
      void autoBreak("tab_closed", start, "WorkforceHub was closed while you were working, so that time was recorded as a break. Click Resume work to continue.");
    }
  }, [record, autoBreak, kv, user.id]);

  // ---- stay in sync: other tabs' changes, and the API's automatic end-of-day check-out ----
  const { refetch } = q;
  useEffect(() => {
    const onStorage = (e: StorageEvent) => e.key === changedKey(user.id) && emitDataChange();
    window.addEventListener("storage", onStorage);
    const t = setInterval(() => {
      const s = live.current.state;
      if ((s === "working" || s === "on_break") && document.visibilityState === "visible") refetch();
    }, REFRESH_MS);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(t);
    };
  }, [refetch, user.id]);

  const value = useMemo<AttendanceSession>(
    () => ({
      record,
      state,
      error: q.error,
      pending,
      lastActivity,
      reload: q.reload,
      checkIn: () => act(attendanceService.checkIn, "Checked in. Have a good day!"),
      startBreak: () => act(() => attendanceService.startBreak({ type: "manual" }), "Break started"),
      resume: () => act(attendanceService.endBreak, "Welcome back. Your session continues."),
      checkOut: () => act(attendanceService.checkOut, "Checked out for today"),
    }),
    [record, state, q.error, q.reload, pending, lastActivity, act],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {warning && state === "working" && (
        <InactivityWarning lastActivity={lastActivity} breakMinutes={settings.inactivityBreakMinutes} onStillHere={touch} />
      )}
    </Ctx.Provider>
  );
}
