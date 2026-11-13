import { ArrowLeft, Pencil, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DeptChip, OverdueBadge, PriorityBadge, TaskStatusBadge } from "../components/domain/Badges";
import { Select, Textarea } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Avatar, DescriptionList, PersonCell } from "../components/ui/Misc";
import { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, QueryView } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useMutation } from "../hooks/useMutation";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { TaskFormModal } from "../modules/tasks/TaskFormModal";
import { canChangeStatus } from "../modules/tasks/taskPermissions";
import { taskService } from "../services";
import type { Task, TaskStatus } from "../types";
import { formatDate, formatDateTime, formatRelative, today } from "../utils/date";
import { fullName } from "../utils/format";
import { STATUS_LABEL, TASK_STATUSES } from "../utils/labels";
import { isOverdue } from "../utils/reports";

export default function TaskDetailPage() {
  const { id = "" } = useParams();
  const q = useQuery(() => taskService.get(id), [id]);
  return (
    <div className="space-y-5">
      <Link to="/tasks" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
        <ArrowLeft className="size-4" aria-hidden /> Tasks
      </Link>
      <QueryView query={q}>{(task) => <TaskDetail task={task} />}</QueryView>
    </div>
  );
}

function TaskDetail({ task }: { task: Task }) {
  const { user, can } = useSession();
  const dir = useDirectory();
  const navigate = useNavigate();
  const status = useMutation();
  const del = useMutation();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const overdue = isOverdue(task, today());
  const mayEdit = can("tasks.create");

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <TaskStatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {overdue && <OverdueBadge />}
          </div>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">{task.title}</h1>
          <p className="mt-0.5 font-mono text-xs text-slate-400">{task.id}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canChangeStatus(task, user.id, can) && (
            <Select
              value={task.status}
              disabled={status.pending}
              onChange={(e) => status.run(() => taskService.setStatus(task.id, e.target.value as TaskStatus, user.id), `Moved to ${STATUS_LABEL[e.target.value as TaskStatus]}`)}
              aria-label="Change status"
              className="w-40"
            >
              {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </Select>
          )}
          {mayEdit && <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>}
          {mayEdit && <Button variant="secondary" icon={Trash2} onClick={() => setConfirmDelete(true)} className="hover:text-red-600">Delete</Button>}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <Card>
            <CardHeader title="Description" />
            <CardBody>
              <p className="whitespace-pre-line text-sm text-slate-700">{task.description || <span className="text-slate-400">No description provided.</span>}</p>
            </CardBody>
          </Card>
          <ActivityHistory task={task} />
        </div>
        <Card>
          <CardHeader title="Details" />
          <CardBody>
            <DescriptionList
              items={[
                { label: "Assignee", value: <PersonCell employee={dir.employee(task.assigneeId)} subtitle={dir.employee(task.assigneeId)?.designation} /> },
                { label: "Department", value: <DeptChip department={dir.department(task.departmentId)} /> },
                { label: "Deadline", value: <span className={overdue ? "font-medium text-red-700" : undefined}>{formatDate(task.dueDate)}</span> },
                { label: "Created by", value: fullName(dir.employee(task.createdById)) },
                { label: "Created", value: formatDateTime(task.createdAt) },
                { label: "Completed", value: task.completedAt ? formatDateTime(task.completedAt) : "—" },
              ]}
            />
          </CardBody>
        </Card>
      </div>

      {editing && <TaskFormModal open onClose={() => setEditing(false)} task={task} employees={dir.employees} departments={dir.departments} />}
      <ConfirmDialog
        open={confirmDelete}
        danger
        title="Delete this task?"
        message={<>“{task.title}” and its activity history will be removed. This can't be undone.</>}
        confirmLabel="Delete task"
        loading={del.pending}
        onClose={() => setConfirmDelete(false)}
        onConfirm={async () => {
          const ok = await del.run(() => taskService.remove(task.id).then(() => true), "Task deleted");
          if (ok) navigate("/tasks", { replace: true });
          else setConfirmDelete(false);
        }}
      />
    </>
  );
}

function ActivityHistory({ task }: { task: Task }) {
  const { user } = useSession();
  const dir = useDirectory();
  const [comment, setComment] = useState("");
  const { run, pending } = useMutation();
  const items = [...task.activity].reverse();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (await run(() => taskService.comment(task.id, comment.trim(), user.id), "Comment added")) setComment("");
  };

  return (
    <Card>
      <CardHeader title="Activity history" description={`${task.activity.length} event(s)`} />
      <form onSubmit={submit} className="flex items-start gap-2 border-b border-slate-100 p-4">
        <Avatar employee={user} />
        <Textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment or update…" aria-label="Comment" className="flex-1" />
        <Button type="submit" icon={Send} loading={pending} disabled={!comment.trim()} aria-label="Post comment">Post</Button>
      </form>
      {items.length === 0 ? (
        <EmptyState title="No activity yet" />
      ) : (
        <ol className="space-y-4 p-4">
          {items.map((a) => {
            const actor = dir.employee(a.actorId);
            return (
              <li key={a.id} className="flex gap-3 text-sm">
                {actor ? <Avatar employee={actor} size="sm" /> : <span className="size-6 rounded-full bg-slate-200" aria-hidden />}
                <div className="min-w-0">
                  <p className="text-slate-700">
                    <span className="font-medium text-slate-900">{fullName(actor)}</span> {a.message}
                  </p>
                  <time dateTime={a.at} title={formatDateTime(a.at)} className="text-xs text-slate-400">{formatRelative(a.at)}</time>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
