import type { Permission, Task } from "../../types";

/** Assignee, creator or anyone who can create tasks may move a task's status. UI hint only. */
export const canChangeStatus = (task: Pick<Task, "assigneeId" | "createdById">, userId: string, can: (p: Permission) => boolean) =>
  task.assigneeId === userId || task.createdById === userId || can("tasks.create");
