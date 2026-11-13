import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, IconButton } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Misc";
import { ConfirmDialog } from "../../components/ui/Modal";
import { EmptyState, ErrorState, Skeleton } from "../../components/ui/States";
import { useDirectory } from "../../hooks/useDirectory";
import { useMutation } from "../../hooks/useMutation";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { departmentService, reportService } from "../../services";
import type { Department } from "../../types";
import { fullName } from "../../utils/format";
import { DepartmentFormModal } from "./DepartmentFormModal";

/** Department cards with live stats; manage actions for roles that can edit departments. */
export function DepartmentGrid() {
  const { can } = useSession();
  const dir = useDirectory();
  const stats = useQuery(() => reportService.departmentStats(), []);
  const [editing, setEditing] = useState<Department | "new" | null>(null);
  const [deleting, setDeleting] = useState<Department | null>(null);
  const del = useMutation();
  const canManage = can("departments.manage");

  if (dir.error) return <ErrorState message={dir.error} onRetry={dir.reload} />;
  if (!dir.ready) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-label="Loading departments">
        {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-44" />)}
      </div>
    );
  }

  return (
    <>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button icon={Plus} onClick={() => setEditing("new")}>New department</Button>
        </div>
      )}
      {dir.departments.length === 0 ? (
        <EmptyState icon={Building2} title="No departments yet" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {dir.departments.map((d) => {
            const s = stats.data?.find((x) => x.departmentId === d.id);
            const head = dir.employee(d.headId);
            return (
              <li key={d.id} className="flex flex-col rounded-lg border border-slate-200 bg-white">
                <div className="flex items-start justify-between gap-2 p-4">
                  <Link to={`/departments/${d.id}`} className="min-w-0 hover:underline">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
                      <h2 className="truncate font-semibold text-slate-900">{d.name}</h2>
                      <span className="font-mono text-xs text-slate-400">{d.code}</span>
                    </div>
                  </Link>
                  {canManage && (
                    <div className="-mr-2 -mt-1 flex">
                      <IconButton icon={Pencil} label={`Edit ${d.name}`} onClick={() => setEditing(d)} />
                      <IconButton icon={Trash2} label={`Delete ${d.name}`} className="hover:text-red-600" onClick={() => setDeleting(d)} />
                    </div>
                  )}
                </div>
                <p className="line-clamp-2 px-4 text-sm text-slate-600">{d.description || "No description."}</p>
                <dl className="mt-4 grid grid-cols-3 border-y border-slate-100 text-center">
                  <Stat label="People" value={s?.employees} />
                  <Stat label="In today" value={s?.present} />
                  <Stat label="Open tasks" value={s?.openTasks} />
                </dl>
                <div className="flex items-center justify-between gap-2 px-4 py-3 text-sm">
                  {head ? (
                    <span className="flex min-w-0 items-center gap-2 text-slate-600">
                      <Avatar employee={head} size="sm" />
                      <span className="truncate">Head: {fullName(head)}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400">No head assigned</span>
                  )}
                  <Link to={`/departments/${d.id}`} className="shrink-0 text-xs font-medium text-brand-700 hover:underline">View</Link>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && <DepartmentFormModal key={editing === "new" ? "new" : editing.id} open onClose={() => setEditing(null)} department={editing === "new" ? undefined : editing} employees={dir.employees} />}
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete department?"
        message={<>Delete <strong>{deleting?.name}</strong>? This only works once nobody is assigned to it.</>}
        confirmLabel="Delete"
        loading={del.pending}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await del.run(() => departmentService.remove(deleting!.id), "Department deleted");
          setDeleting(null);
        }}
      />
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="flex flex-col-reverse py-2.5 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-slate-100">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-lg font-semibold tabular-nums text-slate-900">{value ?? "–"}</dd>
    </div>
  );
}
