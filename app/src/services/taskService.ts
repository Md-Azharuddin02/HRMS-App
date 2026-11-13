import type { TaskService } from "./contracts";
import { db, findOr404, logActivity, nameOf, notify, respond, save } from "./mock/db";
import type { ID, Task, TaskInput } from "../types";
import { uid } from "../utils/format";
import { STATUS_LABEL } from "../utils/labels";

const FIELD_LABEL: Record<keyof TaskInput, string> = {
  title: "title", description: "description", assigneeId: "assignee", departmentId: "department",
  priority: "priority", status: "status", dueDate: "deadline",
};

function track(task: Task, actorId: ID, message: string) {
  task.activity.push({ id: uid("TA"), at: new Date().toISOString(), actorId, message });
}

function notifyAssignee(task: Task, actorId: ID) {
  if (task.assigneeId === actorId) return;
  notify({ recipientId: task.assigneeId, type: "task_assigned", title: "New task assigned", message: `${nameOf(actorId)} assigned you “${task.title}”.`, link: `/tasks/${task.id}` });
}

export const taskService: TaskService = {
  async list(scope) {
    return respond(
      db.tasks.filter(
        (t) => (!scope?.employeeId || t.assigneeId === scope.employeeId) && (!scope?.departmentId || t.departmentId === scope.departmentId),
      ),
    );
  },

  async get(id) {
    return respond(findOr404(db.tasks, id, "Task"));
  },

  async create(input, actorId) {
    const now = new Date().toISOString();
    const task: Task = {
      ...input,
      id: uid("TSK"),
      createdById: actorId,
      createdAt: now,
      completedAt: input.status === "completed" ? now : null,
      activity: [],
    };
    track(task, actorId, `created the task and assigned it to ${nameOf(input.assigneeId)}`);
    db.tasks.unshift(task);
    notifyAssignee(task, actorId);
    logActivity(actorId, "task", `created “${task.title}”`);
    save();
    return respond(task);
  },

  async update(id, patch, actorId) {
    const task = findOr404(db.tasks, id, "Task");
    const reassigned = patch.assigneeId && patch.assigneeId !== task.assigneeId;
    const changed = (Object.keys(patch) as (keyof typeof patch)[]).filter((k) => patch[k] !== task[k]);
    Object.assign(task, patch);
    if (patch.status) task.completedAt = patch.status === "completed" ? task.completedAt ?? new Date().toISOString() : null;
    if (changed.length) track(task, actorId, `updated ${changed.map((k) => FIELD_LABEL[k]).join(", ")}`);
    if (reassigned) notifyAssignee(task, actorId);
    save();
    return respond(task);
  },

  async setStatus(id, status, actorId) {
    const task = findOr404(db.tasks, id, "Task");
    if (task.status === status) return respond(task);
    task.status = status;
    task.completedAt = status === "completed" ? new Date().toISOString() : null;
    track(task, actorId, `moved status to ${STATUS_LABEL[status]}`);
    logActivity(actorId, "task", `moved “${task.title}” to ${STATUS_LABEL[status]}`);
    save();
    return respond(task);
  },

  async comment(id, message, actorId) {
    const task = findOr404(db.tasks, id, "Task");
    track(task, actorId, `commented: ${message}`);
    save();
    return respond(task);
  },

  async remove(id) {
    findOr404(db.tasks, id, "Task");
    db.tasks = db.tasks.filter((t) => t.id !== id);
    save();
    return respond(undefined);
  },
};
