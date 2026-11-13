import { AlertTriangle, CheckCircle2, Clock, Coffee, ListTodo, UserCheck, UserX, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { LeaveStatusBadge } from "../../components/domain/Badges";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { StatCard } from "../../components/ui/Misc";
import { EmptyState, QueryView, Skeleton } from "../../components/ui/States";
import { useDirectory } from "../../hooks/useDirectory";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { leaveService, reportService } from "../../services";
import { addDays, formatDate, today } from "../../utils/date";
import { fullName } from "../../utils/format";
import { LEAVE_TYPE_LABEL } from "../../utils/labels";
import { AttendanceTrendChart } from "./AttendanceTrendChart";
import { DepartmentStatsCard } from "./DepartmentStatsCard";
import { ActivityFeed, NotificationsPreview } from "./FeedCards";

/** Dashboard for roles that oversee others. Department heads get their department; others the whole org. */
export function OrgDashboard() {
  const { scope, can } = useSession();
  const deps = [scope.departmentId, scope.employeeId];
  const summary = useQuery(() => reportService.dashboard(scope), deps);
  const trend = useQuery(() => reportService.attendanceTrend({ from: addDays(today(), -20), to: today() }, scope), deps);

  return (
    <div className="space-y-5">
      <QueryView query={summary} skeleton={<StatSkeleton />}>
        {(s) => (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total employees" value={s.totalEmployees} icon={Users} to="/employees" />
            <StatCard label="Present today" value={s.present} icon={UserCheck} tone="green" hint={`${s.onLeave} on leave`} to="/attendance" />
            <StatCard label="Absent / not in" value={s.absent} icon={UserX} tone="red" to="/attendance" />
            <StatCard label="Currently working" value={s.working} icon={Clock} tone="teal" hint={<span className="inline-flex items-center gap-1"><Coffee className="size-3" aria-hidden />{s.onBreak} on break</span>} to="/attendance" />
            <StatCard label="Total tasks" value={s.totalTasks} icon={ListTodo} tone="blue" to="/tasks" />
            <StatCard label="Completed" value={s.completedTasks} icon={CheckCircle2} tone="green" to="/tasks?status=completed" />
            <StatCard label="Pending" value={s.pendingTasks} icon={ListTodo} tone="amber" to="/tasks?status=open" />
            <StatCard label="Overdue" value={s.overdueTasks} icon={AlertTriangle} tone="red" to="/tasks?status=overdue" />
          </div>
        )}
      </QueryView>

      <div className="grid gap-5 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader title="Attendance analytics" description="Daily attendance over the last 3 weeks" />
          <CardBody>
            <QueryView query={trend} skeleton={<Skeleton className="h-64 w-full" />}>
              {(data) => <AttendanceTrendChart data={data} />}
            </QueryView>
          </CardBody>
        </Card>
        <DepartmentStatsCard onlyId={scope.departmentId} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        <ActivityFeed />
        <NotificationsPreview />
        {can("leaves.approve") && <PendingLeaves />}
      </div>
    </div>
  );
}

function PendingLeaves() {
  const { scope } = useSession();
  const dir = useDirectory();
  const q = useQuery(() => leaveService.list(scope), [scope.departmentId]);
  return (
    <Card>
      <CardHeader title="Leave requests awaiting review" actions={<Link to="/leave?tab=approvals" className="text-xs font-medium text-brand-700 hover:underline">Review</Link>} />
      <QueryView query={q}>
        {(all) => {
          const pending = all.filter((l) => l.status === "pending");
          if (!pending.length) return <EmptyState title="No pending requests" />;
          return (
            <ul className="divide-y divide-slate-100">
              {pending.slice(0, 5).map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{fullName(dir.employee(l.employeeId))}</p>
                    <p className="text-xs text-slate-500">
                      {LEAVE_TYPE_LABEL[l.type]} · {formatDate(l.startDate)} · {l.days}d
                    </p>
                  </div>
                  <LeaveStatusBadge status={l.status} />
                </li>
              ))}
            </ul>
          );
        }}
      </QueryView>
    </Card>
  );
}

function StatSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading statistics">
      {Array.from({ length: 8 }, (_, i) => (
        <Skeleton key={i} className="h-[86px]" />
      ))}
    </div>
  );
}
