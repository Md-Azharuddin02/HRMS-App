import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { cn } from "../utils/format";
import { NAV, isSelfOnly, type NavItem } from "./navigation";

export function Sidebar({ open, onClose, unread }: { open: boolean; onClose: () => void; unread: number }) {
  const { can, role, settings } = useSession();
  const items = NAV.filter((i) => !i.permission || can(i.permission));
  const sections = [...new Set(items.map((i) => i.section))];

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden" onClick={onClose} aria-hidden />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        aria-label="Main navigation"
      >
        <div className="flex h-14 items-center justify-between gap-2 border-b border-slate-200 px-4">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand-600 text-xs font-bold text-white" aria-hidden>
              {settings.companyName.slice(0, 2).toUpperCase()}
            </span>
            <span className="truncate font-semibold text-slate-900">{settings.companyName}</span>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Close menu">
            <X className="size-4" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((s) => (
            <div key={s} className="mb-5">
              <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{s}</p>
              <ul className="space-y-0.5">
                {items.filter((i) => i.section === s).map((i) => (
                  <li key={i.to}>
                    <SideLink item={i} label={isSelfOnly(role) && i.selfLabel ? i.selfLabel : i.label} onNavigate={onClose} count={i.to === "/notifications" ? unread : 0} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <p className="border-t border-slate-200 px-4 py-3 text-[11px] leading-4 text-slate-400">
          Demo build · mock data only. Role switching previews the UI and is not access control.
        </p>
      </aside>
    </>
  );
}

function SideLink({ item, label, onNavigate, count }: { item: NavItem; label: string; onNavigate: () => void; count: number }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm font-medium",
          isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        )
      }
    >
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="flex-1 truncate">{label}</span>
      {count > 0 && <span className="rounded-full bg-red-500 px-1.5 text-[11px] font-semibold text-white" aria-label={`${count} unread`}>{count}</span>}
    </NavLink>
  );
}
