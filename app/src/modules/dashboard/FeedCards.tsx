import { Bell, Activity as ActivityIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Misc";
import { EmptyState, QueryView } from "../../components/ui/States";
import { useDirectory } from "../../hooks/useDirectory";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { activityService, notificationService } from "../../services";
import { cn, fullName } from "../../utils/format";
import { formatRelative } from "../../utils/date";

export function ActivityFeed({ limit = 8 }: { limit?: number }) {
  const { scope } = useSession();
  const dir = useDirectory();
  const q = useQuery(() => activityService.list(limit), [limit, scope.departmentId, scope.employeeId]);
  return (
    <Card>
      <CardHeader title="Recent activity" />
      <QueryView query={q}>
        {(items) =>
          items.length === 0 ? (
            <EmptyState icon={ActivityIcon} title="No activity yet" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.map((a) => {
                const actor = dir.employee(a.actorId);
                return (
                  <li key={a.id} className="flex gap-3 px-4 py-2.5">
                    {actor ? <Avatar employee={actor} size="sm" /> : <span className="size-6 shrink-0 rounded-full bg-slate-200" aria-hidden />}
                    <div className="min-w-0 text-sm">
                      <p className="text-slate-700">
                        <span className="font-medium text-slate-900">{actor ? fullName(actor) : "System"}</span> {a.message}
                      </p>
                      <p className="text-xs text-slate-400">{formatRelative(a.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )
        }
      </QueryView>
    </Card>
  );
}

export function NotificationsPreview({ limit = 5 }: { limit?: number }) {
  const { user } = useSession();
  const q = useQuery(() => notificationService.list(), [user.id]);
  return (
    <Card>
      <CardHeader title="Notifications" actions={<Link to="/notifications" className="text-xs font-medium text-brand-700 hover:underline">View all</Link>} />
      <QueryView query={q}>
        {(items) =>
          items.length === 0 ? (
            <EmptyState icon={Bell} title="You're all caught up" />
          ) : (
            <ul className="divide-y divide-slate-100">
              {items.slice(0, limit).map((n) => (
                <li key={n.id}>
                  <Link to={n.link ?? "/notifications"} className="flex gap-3 px-4 py-2.5 hover:bg-slate-50">
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-brand-500")} aria-hidden />
                    <div className="min-w-0 text-sm">
                      <p className={cn("truncate", n.read ? "text-slate-600" : "font-medium text-slate-900")}>{n.title}</p>
                      <p className="truncate text-xs text-slate-500">{n.message}</p>
                    </div>
                    <span className="ml-auto shrink-0 text-xs text-slate-400">{formatRelative(n.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        }
      </QueryView>
    </Card>
  );
}
