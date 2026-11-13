import { AlertTriangle, Bell, CalendarCheck, CalendarClock, CalendarX, CheckCheck, ClipboardCheck, Info, Trash2, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, IconButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader, Tabs } from "../components/ui/Misc";
import { EmptyState, QueryView } from "../components/ui/States";
import { useMutation } from "../hooks/useMutation";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { notificationService } from "../services";
import type { AppNotification, NotificationType } from "../types";
import { formatDateTime, formatRelative } from "../utils/date";
import { cn } from "../utils/format";

const ICON: Record<NotificationType, { icon: LucideIcon; color: string }> = {
  task_assigned: { icon: ClipboardCheck, color: "bg-blue-50 text-blue-600" },
  task_overdue: { icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  leave_applied: { icon: CalendarClock, color: "bg-amber-50 text-amber-600" },
  leave_approved: { icon: CalendarCheck, color: "bg-emerald-50 text-emerald-600" },
  leave_rejected: { icon: CalendarX, color: "bg-red-50 text-red-600" },
  system: { icon: Info, color: "bg-slate-100 text-slate-600" },
};

type Filter = "all" | "unread" | "tasks" | "leave";
const matches = (n: AppNotification, f: Filter) =>
  f === "all" || (f === "unread" && !n.read) || (f === "tasks" && n.type.startsWith("task")) || (f === "leave" && n.type.startsWith("leave"));

export default function NotificationsPage() {
  const { user } = useSession();
  const q = useQuery(() => notificationService.list(user.id), [user.id]);
  const [filter, setFilter] = useState<Filter>("all");
  const { run, pending } = useMutation();
  const all = q.data ?? [];
  const unread = all.filter((n) => !n.read).length;

  return (
    <>
      <PageHeader
        title="Notifications"
        description={unread ? `You have ${unread} unread notification(s).` : "You're all caught up."}
        actions={<Button variant="secondary" icon={CheckCheck} disabled={!unread} loading={pending} onClick={() => run(() => notificationService.markAllRead(user.id), "All notifications marked as read")}>Mark all as read</Button>}
      />
      <div className="mb-4">
        <Tabs<Filter>
          label="Filter notifications"
          value={filter}
          onChange={setFilter}
          tabs={[
            { id: "all", label: "All", count: all.length },
            { id: "unread", label: "Unread", count: unread },
            { id: "tasks", label: "Tasks" },
            { id: "leave", label: "Leave" },
          ]}
        />
      </div>
      <Card>
        <QueryView query={q}>
          {(items) => {
            const shown = items.filter((n) => matches(n, filter));
            if (!shown.length) return <EmptyState icon={Bell} title="No notifications" message={filter === "unread" ? "Nothing unread. Nice." : undefined} />;
            return (
              <ul className="divide-y divide-slate-100">
                {shown.map((n) => <NotificationRow key={n.id} n={n} />)}
              </ul>
            );
          }}
        </QueryView>
      </Card>
    </>
  );
}

function NotificationRow({ n }: { n: AppNotification }) {
  const { run } = useMutation();
  const { icon: Icon, color } = ICON[n.type];
  const markRead = () => !n.read && run(() => notificationService.markRead(n.id));

  return (
    <li className={cn("flex items-start gap-3 px-4 py-3", !n.read && "bg-brand-50/40")}>
      <span className={cn("mt-0.5 rounded-md p-2", color)}>
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("text-sm", n.read ? "text-slate-700" : "font-semibold text-slate-900")}>{n.title}</p>
          {!n.read && <span className="size-1.5 rounded-full bg-brand-500" aria-label="Unread" />}
        </div>
        <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs">
          <time dateTime={n.createdAt} title={formatDateTime(n.createdAt)} className="text-slate-400">{formatRelative(n.createdAt)}</time>
          {n.link && <Link to={n.link} onClick={markRead} className="font-medium text-brand-700 hover:underline">Open</Link>}
          {!n.read && <button type="button" onClick={markRead} className="font-medium text-slate-500 hover:text-slate-900">Mark as read</button>}
        </div>
      </div>
      <IconButton icon={Trash2} label="Delete notification" className="hover:text-red-600" onClick={() => run(() => notificationService.remove(n.id), "Notification deleted")} />
    </li>
  );
}
