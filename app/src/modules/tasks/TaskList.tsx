import { CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OverdueBadge, PriorityBadge, TaskStatusBadge } from "../../components/domain/Badges";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { PersonCell } from "../../components/ui/Misc";
import { EmptyState } from "../../components/ui/States";
import type { Directory } from "../../hooks/useDirectory";
import { useTable } from "../../hooks/useTable";
import type { Task } from "../../types";
import { formatDate, today } from "../../utils/date";
import { fullName } from "../../utils/format";
import { PRIORITY_RANK, TASK_STATUSES } from "../../utils/labels";
import { isOverdue } from "../../utils/reports";

/** Sortable, paginated task table. Filter (and search) `tasks` before passing them in. */
export function TaskList({ tasks, dir, showAssignee = true, pageSize = 10, emptyAction }: { tasks: Task[]; dir: Directory; showAssignee?: boolean; pageSize?: number; emptyAction?: React.ReactNode }) {
  const navigate = useNavigate();
  const t = today();
  const table = useTable(tasks, {
    searchText: (x) => `${x.title} ${x.id} ${fullName(dir.employee(x.assigneeId))}`,
    sorters: {
      title: (x) => x.title,
      due: (x) => x.dueDate,
      priority: (x) => PRIORITY_RANK[x.priority],
      status: (x) => TASK_STATUSES.indexOf(x.status),
    },
    initialSort: { key: "due", dir: "asc" },
    pageSize,
  });

  const columns: Column<Task>[] = [
    {
      header: "Task",
      sortKey: "title",
      cell: (x) => (
        <div className="min-w-0 max-w-md">
          <p className="truncate font-medium text-slate-900">{x.title}</p>
          <p className="text-xs text-slate-500">{dir.department(x.departmentId)?.name}</p>
        </div>
      ),
    },
    ...(showAssignee ? [{ header: "Assignee", cell: (x: Task) => <PersonCell employee={dir.employee(x.assigneeId)} />, hideBelow: "md" as const }] : []),
    { header: "Priority", sortKey: "priority", cell: (x) => <PriorityBadge priority={x.priority} />, hideBelow: showAssignee ? "xl" : "sm" },
    { header: "Status", sortKey: "status", cell: (x) => <TaskStatusBadge status={x.status} /> },
    {
      header: "Deadline",
      sortKey: "due",
      cell: (x) => (
        <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap">
          <span className={isOverdue(x, t) ? "font-medium text-red-700" : "text-slate-600"}>{formatDate(x.dueDate)}</span>
          {isOverdue(x, t) && <OverdueBadge />}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      table={table}
      columns={columns}
      rowKey={(x) => x.id}
      caption="Tasks"
      onRowClick={(x) => navigate(`/tasks/${x.id}`)}
      empty={<EmptyState icon={CheckSquare} title="No tasks found" message="Nothing matches the current filters." action={emptyAction} />}
    />
  );
}
