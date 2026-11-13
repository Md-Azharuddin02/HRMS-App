import { Columns3, List, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Select } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SearchInput } from "../components/ui/DataTable";
import { PageHeader } from "../components/ui/Misc";
import { QueryView } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { TaskBoard } from "../modules/tasks/TaskBoard";
import { TaskFormModal } from "../modules/tasks/TaskFormModal";
import { TaskList } from "../modules/tasks/TaskList";
import { taskService } from "../services";
import type { Task } from "../types";
import { today } from "../utils/date";
import { cn, fullName } from "../utils/format";
import { PRIORITIES, PRIORITY_LABEL, STATUS_LABEL, TASK_STATUSES } from "../utils/labels";
import { isOverdue } from "../utils/reports";

const STATUS_FILTERS = [
  { id: "", label: "All statuses" },
  { id: "open", label: "Open (not completed)" },
  { id: "overdue", label: "Overdue" },
  ...TASK_STATUSES.map((s) => ({ id: s, label: STATUS_LABEL[s] })),
];

function matchStatus(t: Task, f: string, todayStr: string) {
  if (!f) return true;
  if (f === "open") return t.status !== "completed";
  if (f === "overdue") return isOverdue(t, todayStr);
  return t.status === f;
}

export default function TasksPage() {
  const { can, user, scope } = useSession();
  const dir = useDirectory();
  const [params, setParams] = useSearchParams();
  const teamView = can("tasks.viewAll");
  const taskScope = teamView ? scope : { employeeId: user.id };
  const q = useQuery(() => taskService.list(taskScope), [taskScope.departmentId, taskScope.employeeId]);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("");
  const [dept, setDept] = useState("");
  const [assignee, setAssignee] = useState("");
  const [creating, setCreating] = useState(false);
  const status = params.get("status") ?? "";
  const view = params.get("view") === "board" ? "board" : "list";
  const setParam = (k: string, v: string) =>
    setParams(
      (p) => {
        if (v) p.set(k, v);
        else p.delete(k);
        return p;
      },
      { replace: true },
    );

  const t = today();
  const tasks = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (q.data ?? []).filter(
      (x) =>
        matchStatus(x, status, t) &&
        (!priority || x.priority === priority) &&
        (!dept || x.departmentId === dept) &&
        (!assignee || x.assigneeId === assignee) &&
        (!needle || `${x.title} ${fullName(dir.employee(x.assigneeId))}`.toLowerCase().includes(needle)),
    );
  }, [q.data, status, priority, dept, assignee, query, dir, t]);

  const people = dir.employees.filter((e) => !scope.departmentId || e.departmentId === scope.departmentId);

  return (
    <>
      <PageHeader
        title={teamView ? "Tasks" : "My Tasks"}
        description={teamView ? "Create, assign and track work across the team." : "Tasks assigned to you."}
        actions={
          <>
            <div className="flex rounded-md border border-slate-300 bg-white p-0.5" role="group" aria-label="Layout">
              {(["list", "board"] as const).map((v) => {
                const Icon = v === "list" ? List : Columns3;
                return (
                  <button key={v} type="button" aria-pressed={view === v} onClick={() => setParam("view", v === "board" ? "board" : "")} className={cn("flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium", view === v ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")}>
                    <Icon className="size-3.5" aria-hidden /> {v === "list" ? "List" : "Board"}
                  </button>
                );
              })}
            </div>
            {can("tasks.create") && <Button icon={Plus} onClick={() => setCreating(true)}>New task</Button>}
          </>
        }
      />

      <Card className="mb-4 flex flex-wrap items-center gap-2 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search tasks or assignee…" className="w-full sm:w-64" />
        <Select value={status} onChange={(e) => setParam("status", e.target.value)} aria-label="Filter by status" className="w-full sm:w-44">
          {STATUS_FILTERS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority" className="w-full sm:w-36">
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
        </Select>
        {teamView && !scope.departmentId && (
          <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department" className="w-full sm:w-40">
            <option value="">All departments</option>
            {dir.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        )}
        {teamView && (
          <Select value={assignee} onChange={(e) => setAssignee(e.target.value)} aria-label="Filter by assignee" className="w-full sm:w-44">
            <option value="">All assignees</option>
            {people.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
          </Select>
        )}
        <span className="text-xs text-slate-500 sm:ml-auto">{tasks.length} task(s)</span>
      </Card>

      <QueryView query={q}>
        {() =>
          view === "board" ? (
            <TaskBoard tasks={tasks} dir={dir} />
          ) : (
            <Card>
              <TaskList key={`${status}${priority}${dept}${assignee}${query}`} tasks={tasks} dir={dir} showAssignee={teamView} emptyAction={can("tasks.create") ? <Button icon={Plus} variant="secondary" onClick={() => setCreating(true)}>New task</Button> : undefined} />
            </Card>
          )
        }
      </QueryView>

      {creating && <TaskFormModal open onClose={() => setCreating(false)} employees={dir.employees} departments={dir.departments} />}
    </>
  );
}
