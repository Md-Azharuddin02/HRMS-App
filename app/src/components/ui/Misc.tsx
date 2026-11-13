import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { Employee } from "../../types";
import { cn, fullName, initials } from "../../utils/format";

export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

const avatarColors = ["bg-blue-100 text-blue-700", "bg-amber-100 text-amber-800", "bg-emerald-100 text-emerald-700", "bg-rose-100 text-rose-700", "bg-sky-100 text-sky-700", "bg-brand-100 text-brand-700"];

export function Avatar({ employee, size = "md" }: { employee: Pick<Employee, "id" | "firstName" | "lastName">; size?: "sm" | "md" | "lg" }) {
  const color = avatarColors[Number(employee.id.replace(/\D/g, "")) % avatarColors.length] ?? avatarColors[0];
  const dims = { sm: "size-6 text-[10px]", md: "size-8 text-xs", lg: "size-14 text-lg" }[size];
  return (
    <span aria-hidden className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-semibold", color, dims)}>
      {initials(employee)}
    </span>
  );
}

/** Avatar + name (+ optional subtitle), linking to the profile when `link` is set. */
export function PersonCell({ employee, subtitle, link = true }: { employee: Employee | undefined; subtitle?: ReactNode; link?: boolean }) {
  if (!employee) return <span className="text-slate-400">Unassigned</span>;
  const name = <span className="truncate font-medium text-slate-900">{fullName(employee)}</span>;
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <Avatar employee={employee} />
      <div className="min-w-0">
        {link ? <Link to={`/employees/${employee.id}`} className="block truncate hover:underline" onClick={(e) => e.stopPropagation()}>{name}</Link> : <div className="truncate">{name}</div>}
        {subtitle && <div className="truncate text-xs text-slate-500">{subtitle}</div>}
      </div>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint, tone = "slate", to }: { label: string; value: ReactNode; icon: LucideIcon; hint?: ReactNode; tone?: "slate" | "green" | "amber" | "red" | "blue" | "teal"; to?: string }) {
  const tones = {
    slate: "bg-slate-100 text-slate-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    blue: "bg-blue-50 text-blue-600",
    teal: "bg-brand-50 text-brand-600",
  };
  const body = (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
        {hint && <p className="mt-0.5 truncate text-xs text-slate-500">{hint}</p>}
      </div>
      <span className={cn("rounded-md p-2", tones[tone])}>
        <Icon className="size-4" aria-hidden />
      </span>
    </div>
  );
  return to ? <Link to={to} className="block rounded-lg">{body}</Link> : body;
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="tablist" aria-label={label} className="flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.id}
          role="tab"
          type="button"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium",
            value === t.id ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className="rounded bg-slate-100 px-1.5 text-xs text-slate-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value, className, color = "bg-brand-500", label }: { value: number; className?: string; color?: string; label: string }) {
  return (
    <div className={cn("h-1.5 w-full overflow-hidden rounded-full bg-slate-100", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function DescriptionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="text-xs text-slate-500">{i.label}</dt>
          <dd className="mt-0.5 text-sm text-slate-900">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}
