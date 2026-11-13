import { AlertCircle, ArrowDown, ArrowUp, ChevronsUp, Minus } from "lucide-react";
import type { AttendanceStatus, Department, EmploymentStatus, LeaveStatus, TaskPriority, TaskStatus } from "../../types";
import { ATTENDANCE_LABEL, EMPLOYMENT_LABEL, LEAVE_STATUS_LABEL, PRIORITY_LABEL, STATUS_LABEL } from "../../utils/labels";
import { Badge, type Tone } from "../ui/Badge";

const taskTone: Record<TaskStatus, Tone> = { todo: "neutral", in_progress: "blue", review: "violet", completed: "green" };
export const TaskStatusBadge = ({ status }: { status: TaskStatus }) => <Badge tone={taskTone[status]}>{STATUS_LABEL[status]}</Badge>;

const prioTone: Record<TaskPriority, Tone> = { low: "neutral", medium: "blue", high: "amber", critical: "red" };
const prioIcon = { low: ArrowDown, medium: Minus, high: ArrowUp, critical: ChevronsUp };
export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const Icon = prioIcon[priority];
  return (
    <Badge tone={prioTone[priority]}>
      <Icon className="size-3" aria-hidden />
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}

export const OverdueBadge = () => (
  <Badge tone="red">
    <AlertCircle className="size-3" aria-hidden />
    Overdue
  </Badge>
);

const attTone: Record<AttendanceStatus, Tone> = { present: "green", late: "amber", absent: "red", on_leave: "violet", half_day: "blue" };
export const AttendanceBadge = ({ status }: { status: AttendanceStatus }) => <Badge tone={attTone[status]}>{ATTENDANCE_LABEL[status]}</Badge>;

const leaveTone: Record<LeaveStatus, Tone> = { pending: "amber", approved: "green", rejected: "red" };
export const LeaveStatusBadge = ({ status }: { status: LeaveStatus }) => <Badge tone={leaveTone[status]}>{LEAVE_STATUS_LABEL[status]}</Badge>;

const empTone: Record<EmploymentStatus, Tone> = { active: "green", probation: "blue", on_leave: "violet", inactive: "neutral" };
export const EmploymentBadge = ({ status }: { status: EmploymentStatus }) => <Badge tone={empTone[status]}>{EMPLOYMENT_LABEL[status]}</Badge>;

export function DeptChip({ department }: { department: Department | undefined }) {
  if (!department) return <span className="text-slate-400">—</span>;
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm text-slate-700">
      <span className="size-2 rounded-full" style={{ backgroundColor: department.color }} aria-hidden />
      {department.name}
    </span>
  );
}
