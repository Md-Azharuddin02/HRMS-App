import { Field, Input, Select, Textarea } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { required, useForm, type Errors } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { taskService } from "../../services";
import type { Department, Employee, Task, TaskInput } from "../../types";
import { addDays, today } from "../../utils/date";
import { fullName } from "../../utils/format";
import { PRIORITIES, PRIORITY_LABEL, STATUS_LABEL, TASK_STATUSES } from "../../utils/labels";

interface Props {
  open: boolean;
  onClose: () => void;
  task?: Task;
  employees: Employee[];
  departments: Department[];
}

export function TaskFormModal({ open, onClose, task, employees, departments }: Props) {
  const { scope } = useSession();
  // Department heads can only assign within their department.
  const allowedDeps = scope.departmentId ? departments.filter((d) => d.id === scope.departmentId) : departments;
  const initialDept = task?.departmentId ?? allowedDeps[0]?.id ?? "";

  const validate = (v: TaskInput): Errors<TaskInput> => ({
    title: required(v.title, "Title") ?? (v.title.trim().length > 120 ? "Keep the title under 120 characters" : undefined),
    departmentId: required(v.departmentId, "Department"),
    assigneeId: required(v.assigneeId, "Assignee"),
    dueDate: required(v.dueDate, "Deadline") ?? (!task && v.dueDate < today() ? "Deadline can't be in the past" : undefined),
  });

  const form = useForm<TaskInput>(
    task
      ? { title: task.title, description: task.description, assigneeId: task.assigneeId, departmentId: task.departmentId, priority: task.priority, status: task.status, dueDate: task.dueDate }
      : { title: "", description: "", assigneeId: "", departmentId: initialDept, priority: "medium", status: "todo", dueDate: addDays(today(), 7) },
    validate,
  );
  const { run, pending } = useMutation();
  const { values: v, errors: e, set } = form;
  const assignees = employees.filter((x) => x.departmentId === v.departmentId && x.status !== "inactive");

  const submit = form.handleSubmit(async (values) => {
    const input = { ...values, title: values.title.trim(), description: values.description.trim() };
    const ok = task ? await run(() => taskService.update(task.id, input), "Task updated") : await run(() => taskService.create(input), "Task created and assignee notified");
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={task ? "Edit task" : "Create task"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="task-form" loading={pending}>{task ? "Save changes" : "Create task"}</Button>
        </>
      }
    >
      <form id="task-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" required error={e.title} className="sm:col-span-2"><Input value={v.title} onChange={(x) => set("title", x.target.value)} placeholder="What needs to be done?" /></Field>
        <Field label="Description" className="sm:col-span-2"><Textarea rows={3} value={v.description} onChange={(x) => set("description", x.target.value)} placeholder="Context, acceptance criteria, links…" /></Field>
        <Field label="Department" required error={e.departmentId}>
          <Select
            value={v.departmentId}
            onChange={(x) => {
              set("departmentId", x.target.value);
              set("assigneeId", "");
            }}
          >
            {allowedDeps.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </Field>
        <Field label="Assignee" required error={e.assigneeId}>
          <Select value={v.assigneeId} onChange={(x) => set("assigneeId", x.target.value)}>
            <option value="">Select a person…</option>
            {assignees.map((a) => <option key={a.id} value={a.id}>{fullName(a)} — {a.designation}</option>)}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={v.priority} onChange={(x) => set("priority", x.target.value as TaskInput["priority"])}>
            {PRIORITIES.map((p) => <option key={p} value={p}>{PRIORITY_LABEL[p]}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={v.status} onChange={(x) => set("status", x.target.value as TaskInput["status"])}>
            {TASK_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </Select>
        </Field>
        <Field label="Deadline" required error={e.dueDate}><Input type="date" min={task ? undefined : today()} value={v.dueDate} onChange={(x) => set("dueDate", x.target.value)} /></Field>
      </form>
    </Modal>
  );
}
