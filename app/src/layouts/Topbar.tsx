import { Bell, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar } from "../components/ui/Misc";
import { useSession } from "../hooks/useSession";
import type { Role } from "../types";
import { fullName } from "../utils/format";
import { ROLES, ROLE_LABELS } from "../utils/permissions";

export function Topbar({ onMenu, unread }: { onMenu: () => void; unread: number }) {
  const { user, role, switchRole } = useSession();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onMenu} className="-ml-1 rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <span className="hidden sm:inline">View as</span>
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as Role)}
            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-medium text-slate-800 focus:border-brand-500 focus:outline-none"
            aria-label="Preview the app as role"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </label>

        <Link to="/notifications" className="relative rounded-md p-1.5 text-slate-600 hover:bg-slate-100" aria-label={`Notifications, ${unread} unread`}>
          <Bell className="size-5" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-4 text-white">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Link>

        <Link to={`/employees/${user.id}`} className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-slate-100">
          <Avatar employee={user} />
          <span className="hidden text-left leading-tight md:block">
            <span className="block text-sm font-medium text-slate-900">{fullName(user)}</span>
            <span className="block text-xs text-slate-500">{ROLE_LABELS[role]}</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
