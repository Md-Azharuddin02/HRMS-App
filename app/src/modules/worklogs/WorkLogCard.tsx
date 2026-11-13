import { AlertOctagon, CheckCircle2, CircleDashed, Pencil, Trash2 } from "lucide-react";
import { Badge } from "../../components/ui/Badge";
import { IconButton } from "../../components/ui/Button";
import { PersonCell } from "../../components/ui/Misc";
import type { Employee, WorkLog } from "../../types";
import { formatDate, formatHours, formatTime } from "../../utils/date";

interface Props {
  log: WorkLog;
  employee?: Employee;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function WorkLogCard({ log, employee, onEdit, onDelete }: Props) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <header className="flex flex-wrap items-start justify-between gap-2">
        {employee ? <PersonCell employee={employee} subtitle={formatDate(log.date)} /> : <h3 className="font-semibold text-slate-900">{formatDate(log.date)}</h3>}
        <div className="flex items-center gap-1">
          <Badge tone="teal">{formatHours(log.hours)}</Badge>
          {log.blockers && <Badge tone="red">Blocked</Badge>}
          {onEdit && <IconButton icon={Pencil} label="Edit log" onClick={onEdit} />}
          {onDelete && <IconButton icon={Trash2} label="Delete log" className="hover:text-red-600" onClick={onDelete} />}
        </div>
      </header>
      <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
        <Section icon={CheckCircle2} color="text-emerald-600" title="Completed" items={log.completed} />
        <Section icon={CircleDashed} color="text-blue-600" title="Ongoing" items={log.ongoing} />
      </div>
      {log.blockers && (
        <p className="mt-3 flex gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">
          <AlertOctagon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span><span className="font-medium">Blocker:</span> {log.blockers}</span>
        </p>
      )}
      {log.remarks && <p className="mt-3 text-sm text-slate-600"><span className="font-medium text-slate-700">Remarks:</span> {log.remarks}</p>}
      <p className="mt-3 text-xs text-slate-400">Submitted {formatDate(log.submittedAt)} at {formatTime(log.submittedAt)}</p>
    </article>
  );
}

function Section({ icon: Icon, color, title, items }: { icon: typeof CheckCircle2; color: string; title: string; items: string[] }) {
  return (
    <div>
      <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">{title}</h4>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((x, i) => (
            <li key={i} className="flex gap-2 text-slate-700">
              <Icon className={`mt-0.5 size-4 shrink-0 ${color}`} aria-hidden />
              {x}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-400">—</p>
      )}
    </div>
  );
}
