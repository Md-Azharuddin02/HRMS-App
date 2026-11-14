import { Suspense, useState } from "react";
import { Outlet } from "react-router-dom";
import { ListSkeleton } from "../components/ui/States";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { notificationService } from "../services";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useSession();
  const notes = useQuery(() => notificationService.list(), [user.id]);
  const unread = notes.data?.filter((n) => !n.read).length ?? 0;

  return (
    <div className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} unread={unread} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setMenuOpen(true)} unread={unread} />
        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Suspense fallback={<ListSkeleton rows={8} label="Loading page" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
