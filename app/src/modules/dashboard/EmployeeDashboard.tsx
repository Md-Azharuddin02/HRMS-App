import { AlertTriangle, CheckCircle2, ListTodo, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { OverdueBadge, PriorityBadge, TaskStatusBadge } from "../../components/domain/Badges";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Progress, StatCard } from "../../components/ui/Misc";
import { EmptyState, QueryView } from "../../components/ui/States";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { leaveService, taskService } from "../../services";
import { formatDate, today } from "../../utils/date";
import { pct } from "../../utils/format";
import { LEAVE_TYPE_LABEL } from "../../utils/labels";
import { isOverdue } from "../../utils/reports";
import { ClockCard } from "../attendance/ClockCard";
import { NotificationsPreview } from "./FeedCards";

/** Personal dashboard for the Employee role. */
export function EmployeeDashboard() {
  const { user } = useSession();
  const tasks = useQuery(() => taskService.list({ employeeId: user.id }), [user.id]);
  const balances = useQuery(() => leaveService.balances(user.id), [user.id]);
  const t = today();

  return (
    <div className="space-y-5">
      <QueryView query={tasks}>
        {(list) => {
          const open = list.filter((x) => x.status !== "completed");
          return (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <StatCard label="My open tasks" value={open.length} icon={ListTodo} tone="blue" to="/tasks" />
              <StatCard label="In review" value={list.filter((x) => x.status === "review").length} icon={Timer} tone="teal" to="/tasks?status=review" />
              <StatCard label="Completed" value={list.length - open.length} icon={CheckCircle2} tone="green" to="/tasks?status=completed" />
              <StatCard label="Overdue" value={open.filter((x) => isOverdue(x, t)).length} icon={AlertTriangle} tone="red" to="/tasks?status=overdue" />
            </div>
          );
        }}
      </QueryView>

      <div className="grid gap-5 lg:grid-cols-2">
        <ClockCard />
        <Card>
          <CardHeader title="Leave balance" actions={<Link to="/leave" className="text-xs font-medium text-brand-700 hover:underline">Apply</Link>} />
          <QueryView query={balances}>
            {(bals) => (
              <CardBody className="space-y-3">
                {bals.filter((b) => b.allowance !== null).map((b) => (
                  <div key={b.type}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="text-slate-700">{LEAVE_TYPE_LABEL[b.type]}</span>
                      <span className="tabular-nums text-slate-500">{b.allowance! - b.used} of {b.allowance} left</span>
                    </div>
                    <Progress value={pct(b.used, b.allowance!)} label={`${LEAVE_TYPE_LABEL[b.type]} leave used`} />
                  </div>
                ))}
              </CardBody>
            )}
          </QueryView>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader title="Upcoming deadlines" actions={<Link to="/tasks" className="text-xs font-medium text-brand-700 hover:underline">All tasks</Link>} />
          <QueryView query={tasks}>
            {(list) => {
              const open = list.filter((x) => x.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, 6);
              if (!open.length) return <EmptyState title="No open tasks" message="Nothing on your plate right now." />;
              return (
                <ul className="divide-y divide-slate-100">
                  {open.map((x) => (
                    <li key={x.id}>
                      <Link to={`/tasks/${x.id}`} className="flex flex-wrap items-center gap-2 px-4 py-2.5 hover:bg-slate-50">
                        <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-900">{x.title}</span>
                        {isOverdue(x, t) && <OverdueBadge />}
                        <PriorityBadge priority={x.priority} />
                        <TaskStatusBadge status={x.status} />
                        <span className="w-full text-xs text-slate-500 sm:w-auto">Due {formatDate(x.dueDate)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              );
            }}
          </QueryView>
        </Card>
        <NotificationsPreview />
      </div>
    </div>
  );
}
