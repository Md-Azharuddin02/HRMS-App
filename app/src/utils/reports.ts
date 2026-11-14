import type { Task } from "../types";

/** Report maths lives in the API; the UI only needs this to flag overdue tasks. */
export const isOverdue = (t: Pick<Task, "status" | "dueDate">, todayStr: string) => t.status !== "completed" && t.dueDate < todayStr;
