import { Bell, KeyRound, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton } from "../components/ui/Button";
import { Avatar } from "../components/ui/Misc";
import { useSession } from "../hooks/useSession";
import { fullName } from "../utils/format";
import { ROLE_LABELS } from "../utils/permissions";
import { ChangePasswordModal } from "./ChangePasswordModal";

export function Topbar({ onMenu, unread }: { onMenu: () => void; unread: number }) {
  const { user, role, signOut } = useSession();
  const [changingPassword, setChangingPassword] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      <button type="button" onClick={onMenu} className="-ml-1 rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
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
        <IconButton icon={KeyRound} label="Change password" onClick={() => setChangingPassword(true)} />
        <IconButton
          icon={LogOut}
          label="Sign out"
          disabled={signingOut}
          onClick={() => {
            setSigningOut(true);
            void signOut();
          }}
        />
      </div>
      {changingPassword && <ChangePasswordModal open onClose={() => setChangingPassword(false)} />}
    </header>
  );
}
