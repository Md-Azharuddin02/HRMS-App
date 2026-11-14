/**
 * Browser-side bookkeeping for the attendance session: which app tabs are open, when the app was last closed,
 * and when the employee last interacted (shared across tabs).
 *
 * Best effort by design:
 * - `pagehide` usually fires when a tab closes, but browsers don't guarantee it (crashes, killed processes,
 *   OS shutdown) and can't tell a close from a refresh. A refresh is told apart by how quickly the app comes back.
 * - localStorage is per browser and editable by the user; the API re-validates every timestamp it is sent.
 * Corrupt or missing entries are ignored rather than trusted.
 */

export interface KV {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** Reopening within this window is treated as a refresh/navigation, not a closed app. */
export const REOPEN_GRACE_MS = 60_000;
/** A tab whose heartbeat is older than this is considered gone. */
export const TAB_STALE_MS = 30_000;
export const TAB_HEARTBEAT_MS = 10_000;

const TABS_KEY = "wfh.att.tabs";
const closedKey = (userId: string) => `wfh.att.${userId}.closedAt`;
const activityKey = (userId: string) => `wfh.att.${userId}.lastActivity`;
export const changedKey = (userId: string) => `wfh.att.${userId}.changed`;

export interface ClosedMarker {
  attendanceId: string;
  at: number;
}

function readJson<T>(kv: KV, key: string, valid: (v: unknown) => v is T): T | null {
  try {
    const raw = kv.getItem(key);
    if (!raw) return null;
    const v: unknown = JSON.parse(raw);
    if (valid(v)) return v;
  } catch {
    // corrupt JSON: fall through and drop it
  }
  safe(() => kv.removeItem(key));
  return null;
}

function safe(fn: () => void) {
  try {
    fn();
  } catch {
    // storage full, disabled or blocked (private mode): the session still works, just without this hint
  }
}

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isTabs = (v: unknown): v is Record<string, number> => isRecord(v) && Object.values(v).every((x) => typeof x === "number");
const isMarker = (v: unknown): v is ClosedMarker => isRecord(v) && typeof v.attendanceId === "string" && typeof v.at === "number";
const isTime = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v > 0;

// ---- open tabs ----

export function heartbeatTab(kv: KV, tabId: string, now: number) {
  const tabs = readJson(kv, TABS_KEY, isTabs) ?? {};
  for (const [id, seen] of Object.entries(tabs)) if (now - seen > TAB_STALE_MS) delete tabs[id];
  tabs[tabId] = now;
  safe(() => kv.setItem(TABS_KEY, JSON.stringify(tabs)));
}

/** Removes this tab and reports whether any other app tab is still alive. */
export function closeTab(kv: KV, tabId: string, now: number): { othersOpen: boolean } {
  const tabs = readJson(kv, TABS_KEY, isTabs) ?? {};
  delete tabs[tabId];
  const othersOpen = Object.values(tabs).some((seen) => now - seen <= TAB_STALE_MS);
  safe(() => kv.setItem(TABS_KEY, JSON.stringify(tabs)));
  return { othersOpen };
}

// ---- app closed while working ----

export function markClosed(kv: KV, userId: string, marker: ClosedMarker) {
  safe(() => kv.setItem(closedKey(userId), JSON.stringify(marker)));
}

/**
 * Reads and clears the "app was closed" marker. Returns when the break should start, or null if the app
 * was only refreshed, the marker belongs to another session, or there is none.
 */
export function takeClosedBreakStart(kv: KV, userId: string, attendanceId: string, now: number): number | null {
  const marker = readJson(kv, closedKey(userId), isMarker);
  safe(() => kv.removeItem(closedKey(userId)));
  if (!marker || marker.attendanceId !== attendanceId || marker.at > now) return null;
  return now - marker.at >= REOPEN_GRACE_MS ? marker.at : null;
}

// ---- last interaction, shared by all tabs ----

export function writeActivity(kv: KV, userId: string, at: number) {
  safe(() => kv.setItem(activityKey(userId), String(at)));
}

export function readActivity(kv: KV, userId: string): number | null {
  try {
    const v = Number(kv.getItem(activityKey(userId)));
    return isTime(v) ? v : null;
  } catch {
    return null;
  }
}

/** What the inactivity watcher should do now. */
export function inactivityStep(idleMs: number, warnMinutes: number, breakMinutes: number): "ok" | "warn" | "break" {
  if (idleMs >= breakMinutes * 60_000) return "break";
  if (idleMs >= warnMinutes * 60_000) return "warn";
  return "ok";
}

export function browserStorage(): KV {
  try {
    return window.localStorage;
  } catch {
    const mem = new Map<string, string>();
    return { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, v), removeItem: (k) => void mem.delete(k) };
  }
}
