import { Link } from "react-router-dom";
import { OverdueBadge, PriorityBadge } from "../../components/domain/Badges";
import { Avatar } from "../../components/ui/Misc";
import type { Directory } from "../../hooks/useDirectory";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { taskService } from "../../services";
import type { Task, TaskStatus } from "../../types";
import { formatDate, today } from "../../utils/date";
import { cn, fullName } from "../../utils/format";
import { PRIORITY_RANK, STATUS_LABEL, TASK_STATUSES } from "../../utils/labels";
import { isOverdue } from "../../utils/reports";
import { canChangeStatus } from "./taskPermissions";

const COLUMN_ACCENT: Record<TaskStatus, string> = { todo: "bg-slate-400", in_progress: "bg-blue-500", review: "bg-violet-500", completed: "bg-emerald-500" };

/** Kanban-style board. Status is changed with a select on each card (keyboard-friendly, no drag-and-drop). */
export function TaskBoard({ tasks, dir }: { tasks: Task[]; dir: Directory }) {
  const { user, can } = useSession();
  const { run } = useMutation();
  const t = today();

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {TASK_STATUSES.map((status) => {
        const col = tasks.filter((x) => x.status === status).sort((a, b) => PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || a.dueDate.localeCompare(b.dueDate));
        return (
          <section key={status} aria-label={`${STATUS_LABEL[status]} column`} className="flex flex-col rounded-lg bg-slate-100/70 p-2">
            <h2 className="flex items-center gap-2 px-1.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <span className={cn("size-2 rounded-full", COLUMN_ACCENT[status])} aria-hidden />
              {STATUS_LABEL[status]}
              <span className="ml-auto font-normal text-slate-400">{col.length}</span>
            </h2>
            <ul className="mt-1 space-y-2">
              {col.length === 0 && <li className="rounded-md border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">No tasks</li>}
              {col.map((task) => {
                const assignee = dir.employee(task.assigneeId);
                return (
                  <li key={task.id} className="rounded-md border border-slate-200 bg-white p-3">
                    <Link to={`/tasks/${task.id}`} className="block text-sm font-medium text-slate-900 hover:underline">{task.title}</Link>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <PriorityBadge priority={task.priority} />
                      {isOverdue(task, t) && <OverdueBadge />}
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                        {assignee && <Avatar employee={assignee} size="sm" />}
                        <span className="truncate">{assignee ? fullName(assignee) : "Unassigned"}</span>
                      </span>
                      <span className={cn("shrink-0 text-xs", isOverdue(task, t) ? "font-medium text-red-700" : "text-slate-500")}>{formatDate(task.dueDate)}</span>
                    </div>
                    {canChangeStatus(task, user.id, can) && (
                      <select
                        value={task.status}
                        onChange={(e) => run(() => taskService.setStatus(task.id, e.target.value as TaskStatus), `Moved to ${STATUS_LABEL[e.target.value as TaskStatus]}`)}
                        aria-label={`Change status of ${task.title}`}
                        className="mt-2 h-7 w-full rounded border border-slate-200 bg-slate-50 px-1.5 text-xs text-slate-700 focus:border-brand-500 focus:outline-none"
                      >
                        {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
