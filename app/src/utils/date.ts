import type { DateFormat, DateString } from "../types";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar date as YYYY-MM-DD (not UTC, so "today" matches the user's clock). */
export function toDateString(d: Date): DateString {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDate(s: DateString): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export const today = (): DateString => toDateString(new Date());

export function addDays(s: DateString, n: number): DateString {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toDateString(d);
}

/** Inclusive list of dates between from and to. */
export function eachDay(from: DateString, to: DateString): DateString[] {
  const out: DateString[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

export function isWeekend(s: DateString, weekendDays: number[]): boolean {
  return weekendDays.includes(parseDate(s).getDay());
}

/** Working days in an inclusive range, excluding weekend days. */
export function countWorkingDays(from: DateString, to: DateString, weekendDays: number[]): number {
  if (to < from) return 0;
  return eachDay(from, to).filter((d) => !isWeekend(d, weekendDays)).length;
}

/** A timestamp on a local date at HH:mm. */
export function atTime(date: DateString, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = parseDate(date);
  d.setHours(h, m, 0, 0);
  return d;
}

export function startOfWeek(s: DateString): DateString {
  const d = parseDate(s);
  const diff = (d.getDay() + 6) % 7; // Monday start
  return addDays(s, -diff);
}

export function startOfMonth(s: DateString): DateString {
  return s.slice(0, 8) + "01";
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let dateFormat: DateFormat = "dd MMM yyyy";
/** Set from app settings by the session provider. */
export const setDateFormat = (f: DateFormat) => {
  dateFormat = f;
};

export function formatDate(s: DateString | null | undefined): string {
  if (!s) return "—";
  // Full ISO timestamps are converted to the local calendar day first.
  const day = s.length > 10 ? toDateString(new Date(s)) : s;
  const d = parseDate(day);
  if (dateFormat === "yyyy-MM-dd") return day;
  if (dateFormat === "dd/MM/yyyy") return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  return `${pad(d.getDate())} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(s: DateString): string {
  const d = parseDate(s);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function formatTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDateTime(iso: string): string {
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

export function formatRelative(iso: string, now: Date = new Date()): string {
  const mins = Math.round((now.getTime() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return m === 60 ? `${h + 1}h 0m` : `${h}h ${m}m`;
}
