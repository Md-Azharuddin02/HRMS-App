import { ArrowLeft, CheckCircle2, ListTodo, UserCheck, Users } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EmploymentBadge } from "../components/domain/Badges";
import { Card, CardBody } from "../components/ui/Card";
import { PersonCell, StatCard, Tabs } from "../components/ui/Misc";
import { EmptyState, QueryView } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { TaskList } from "../modules/tasks/TaskList";
import { departmentService, reportService, taskService } from "../services";
import { fullName } from "../utils/format";

type Tab = "people" | "tasks";

export default function DepartmentDetailPage() {
  const { id = "" } = useParams();
  const { can, user } = useSession();
  const dir = useDirectory();
  const dep = useQuery(() => departmentService.get(id), [id]);
  const summary = useQuery(() => reportService.dashboard({ departmentId: id }), [id]);
  const tasks = useQuery(() => taskService.list({ departmentId: id }), [id]);
  const [tab, setTab] = useState<Tab>("people");
  const members = dir.employees.filter((e) => e.departmentId === id);
  // Employees see their own department's tasks only if they're assigned; leads/admins see all.
  const canSeeTasks = can("tasks.viewAll") || user.departmentId === id;

  return (
    <QueryView query={dep}>
      {(d) => {
        const head = dir.employee(d.headId);
        const visibleTasks = (tasks.data ?? []).filter((t) => can("tasks.viewAll") || t.assigneeId === user.id);
        return (
          <div className="space-y-5">
            <Link to="/departments" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="size-4" aria-hidden /> Departments
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
                <h1 className="text-xl font-semibold text-slate-900">{d.name}</h1>
                <span className="font-mono text-xs text-slate-400">{d.code}</span>
              </div>
              <p className="mt-1 max-w-2xl text-sm text-slate-600">{d.description}</p>
              <p className="mt-2 text-sm text-slate-600">
                Head:{" "}
                {head ? <Link className="font-medium text-brand-700 hover:underline" to={`/employees/${head.id}`}>{fullName(head)}</Link> : "Not assigned"}
              </p>
            </div>

            <QueryView query={summary}>
              {(s) => (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <StatCard label="Employees" value={s.totalEmployees} icon={Users} />
                  <StatCard label="Present today" value={s.present} icon={UserCheck} tone="green" />
                  <StatCard label="Open tasks" value={s.pendingTasks} icon={ListTodo} tone="amber" hint={`${s.overdueTasks} overdue`} />
                  <StatCard label="Completed tasks" value={s.completedTasks} icon={CheckCircle2} tone="teal" />
                </div>
              )}
            </QueryView>

            <Card>
              <div className="px-4 pt-2">
                <Tabs<Tab>
                  label="Department details"
                  value={tab}
                  onChange={setTab}
                  tabs={[{ id: "people", label: "Employees", count: members.length }, ...(canSeeTasks ? [{ id: "tasks" as const, label: "Assigned tasks", count: visibleTasks.length }] : [])]}
                />
              </div>
              {tab === "people" &&
                (members.length === 0 ? (
                  <EmptyState icon={Users} title="No employees in this department" />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {members.map((m) => (
                      <li key={m.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                        <PersonCell employee={m} subtitle={m.designation} link={can("employees.view") || m.id === user.id} />
                        <EmploymentBadge status={m.status} />
                      </li>
                    ))}
                  </ul>
                ))}
              {tab === "tasks" && canSeeTasks && (
                <QueryView query={tasks}>{() => <TaskList tasks={visibleTasks} dir={dir} />}</QueryView>
              )}
            </Card>
            {!canSeeTasks && <CardBody className="text-sm text-slate-500">Task details are visible to members of this department and managers.</CardBody>}
          </div>
        );
      }}
    </QueryView>
  );
}
