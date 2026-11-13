import { Pencil, Trash2, UserPlus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DeptChip, EmploymentBadge } from "../../components/domain/Badges";
import { Select } from "../../components/form/Field";
import { Button, IconButton } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { DataTable, SearchInput, type Column } from "../../components/ui/DataTable";
import { PersonCell } from "../../components/ui/Misc";
import { ConfirmDialog } from "../../components/ui/Modal";
import { EmptyState, ErrorState, ListSkeleton } from "../../components/ui/States";
import { useDirectory } from "../../hooks/useDirectory";
import { useMutation } from "../../hooks/useMutation";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { useTable } from "../../hooks/useTable";
import { employeeService } from "../../services";
import type { Employee } from "../../types";
import { formatDate } from "../../utils/date";
import { fullName } from "../../utils/format";
import { EMPLOYMENT_LABEL, EMPLOYMENT_STATUSES } from "../../utils/labels";
import { ROLE_LABELS } from "../../utils/permissions";
import { EmployeeFormModal } from "./EmployeeFormModal";

/** Searchable, filterable employee directory with add/edit/delete. Used on the Employees page and in Admin. */
export function EmployeeTable() {
  const { scope, can } = useSession();
  const dir = useDirectory();
  const navigate = useNavigate();
  const q = useQuery(() => employeeService.list(scope), [scope.departmentId]);
  const [dept, setDept] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Employee | "new" | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);
  const del = useMutation();
  const canManage = can("employees.manage");

  const rows = useMemo(() => (q.data ?? []).filter((e) => (!dept || e.departmentId === dept) && (!status || e.status === status)), [q.data, dept, status]);
  const table = useTable(rows, {
    searchText: (e) => `${fullName(e)} ${e.id} ${e.email} ${e.designation}`,
    sorters: { name: (e) => fullName(e), id: (e) => e.id, joined: (e) => e.joiningDate, dept: (e) => dir.department(e.departmentId)?.name ?? "" },
    initialSort: { key: "id", dir: "asc" },
  });

  const columns: Column<Employee>[] = [
    { header: "Employee", sortKey: "name", cell: (e) => <PersonCell employee={e} subtitle={e.email} /> },
    { header: "ID", sortKey: "id", cell: (e) => <span className="font-mono text-xs text-slate-600">{e.id}</span>, hideBelow: "md" },
    { header: "Department", sortKey: "dept", cell: (e) => <DeptChip department={dir.department(e.departmentId)} />, hideBelow: "sm" },
    { header: "Designation", cell: (e) => <span className="text-slate-700">{e.designation}</span>, hideBelow: "xl" },
    { header: "Role", cell: (e) => <span className="whitespace-nowrap text-slate-600">{ROLE_LABELS[e.role]}</span>, hideBelow: "xl" },
    { header: "Joined", sortKey: "joined", cell: (e) => <span className="whitespace-nowrap text-slate-600">{formatDate(e.joiningDate)}</span>, hideBelow: "md" },
    { header: "Status", cell: (e) => <EmploymentBadge status={e.status} /> },
  ];
  if (canManage) {
    columns.push({
      header: "Actions",
      className: "w-20 text-right",
      cell: (e) => (
        <div className="flex justify-end" onClick={(ev) => ev.stopPropagation()}>
          <IconButton icon={Pencil} label={`Edit ${fullName(e)}`} onClick={() => setEditing(e)} />
          <IconButton icon={Trash2} label={`Delete ${fullName(e)}`} className="hover:text-red-600" onClick={() => setDeleting(e)} />
        </div>
      ),
    });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 p-3">
        <SearchInput value={table.query} onChange={table.setQuery} placeholder="Search name, ID, email…" className="w-full sm:w-64" />
        {!scope.departmentId && (
          <Select value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Filter by department" className="w-full sm:w-44">
            <option value="">All departments</option>
            {dir.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        )}
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="w-full sm:w-40">
          <option value="">All statuses</option>
          {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{EMPLOYMENT_LABEL[s]}</option>)}
        </Select>
        {canManage && <Button icon={UserPlus} className="sm:ml-auto" onClick={() => setEditing("new")}>Add employee</Button>}
      </div>

      {q.error && !q.data ? (
        <ErrorState message={q.error} onRetry={q.reload} />
      ) : !q.data ? (
        <ListSkeleton rows={8} label="Loading employees" />
      ) : (
        <DataTable
          table={table}
          columns={columns}
          rowKey={(e) => e.id}
          caption="Employees"
          onRowClick={(e) => navigate(`/employees/${e.id}`)}
          empty={<EmptyState icon={Users} title="No employees found" message={table.query || dept || status ? "Try clearing the search or filters." : "Add your first employee to get started."} />}
        />
      )}

      {editing && <EmployeeFormModal key={editing === "new" ? "new" : editing.id} open onClose={() => setEditing(null)} employee={editing === "new" ? undefined : editing} departments={dir.departments} />}
      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete employee?"
        message={<>This permanently removes <strong>{fullName(deleting)}</strong> ({deleting?.id}). Their historical attendance and tasks remain for reporting.</>}
        confirmLabel="Delete"
        loading={del.pending}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await del.run(() => employeeService.remove(deleting!.id), "Employee deleted");
          setDeleting(null);
        }}
      />
    </Card>
  );
}
