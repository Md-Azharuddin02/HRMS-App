import type { Employee } from "../types";

export const cn = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

export const fullName = (e: Pick<Employee, "firstName" | "lastName"> | null | undefined) =>
  e ? `${e.firstName} ${e.lastName}` : "Unknown";

export const initials = (e: Pick<Employee, "firstName" | "lastName">) => `${e.firstName[0]}${e.lastName[0]}`.toUpperCase();

export const pct = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100));

export const titleCase = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
