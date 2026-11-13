import { CalendarDays, Check, X } from "lucide-react";
import { LeaveStatusBadge } from "../../components/domain/Badges";
import { Button } from "../../components/ui/Button";
import { DataTable, type Column } from "../../components/ui/DataTable";
import { PersonCell } from "../../components/ui/Misc";
import { EmptyState } from "../../components/ui/States";
import type { Directory } from "../../hooks/useDirectory";
import { useTable } from "../../hooks/useTable";
import type { LeaveRequest } from "../../types";
import { formatDate } from "../../utils/date";
import { fullName } from "../../utils/format";
import { LEAVE_TYPE_LABEL } from "../../utils/labels";

interface Props {
  leaves: LeaveRequest[];
  dir: Directory;
  showEmployee?: boolean;
  onReview?: (l: LeaveRequest, d: "approved" | "rejected") => void;
  onWithdraw?: (l: LeaveRequest) => void;
  emptyMessage?: string;
}

export function LeaveTable({ leaves, dir, showEmployee, onReview, onWithdraw, emptyMessage }: Props) {
  const table = useTable(leaves, {
    searchText: (l) => fullName(dir.employee(l.employeeId)),
    sorters: { start: (l) => l.startDate, applied: (l) => l.appliedAt, days: (l) => l.days },
    initialSort: { key: "applied", dir: "desc" },
  });

  const columns: Column<LeaveRequest>[] = [
    ...(showEmployee ? [{ header: "Employee", cell: (l: LeaveRequest) => <PersonCell employee={dir.employee(l.employeeId)} subtitle={dir.department(dir.employee(l.employeeId)?.departmentId)?.name} /> }] : []),
    { header: "Type", cell: (l) => <span className="font-medium text-slate-800">{LEAVE_TYPE_LABEL[l.type]}</span> },
    { header: "Dates", sortKey: "start", cell: (l) => <span className="whitespace-nowrap text-slate-700">{formatDate(l.startDate)}{l.endDate !== l.startDate && ` – ${formatDate(l.endDate)}`}</span> },
    { header: "Days", sortKey: "days", cell: (l) => <span className="tabular-nums">{l.days}</span>, hideBelow: "sm" },
    { header: "Reason", cell: (l) => <span className="line-clamp-2 max-w-xs text-slate-600">{l.reason}</span>, hideBelow: "xl" },
    {
      header: "Status",
      cell: (l) => (
        <div>
          <LeaveStatusBadge status={l.status} />
          {l.reviewedById && <p className="mt-1 text-xs text-slate-500">by {fullName(dir.employee(l.reviewedById))}{l.reviewNote && `: “${l.reviewNote}”`}</p>}
        </div>
      ),
    },
    { header: "Applied", sortKey: "applied", cell: (l) => <span className="whitespace-nowrap text-slate-500">{formatDate(l.appliedAt)}</span>, hideBelow: "xl" },
  ];

  if (onReview || onWithdraw) {
    columns.push({
      header: "Actions",
      className: "text-right",
      cell: (l) =>
        l.status !== "pending" ? null : (
          <div className="flex justify-end gap-1.5">
            {onReview && (
              <>
                <Button size="sm" icon={Check} aria-label="Approve" title="Approve" onClick={() => onReview(l, "approved")}><span className="hidden xl:inline">Approve</span></Button>
                <Button size="sm" variant="secondary" icon={X} aria-label="Reject" title="Reject" onClick={() => onReview(l, "rejected")}><span className="hidden xl:inline">Reject</span></Button>
              </>
            )}
            {onWithdraw && <Button size="sm" variant="ghost" onClick={() => onWithdraw(l)}>Withdraw</Button>}
          </div>
        ),
    });
  }

  return (
    <DataTable
      table={table}
      columns={columns}
      rowKey={(l) => l.id}
      caption="Leave requests"
      empty={<EmptyState icon={CalendarDays} title="No leave requests" message={emptyMessage} />}
    />
  );
}
