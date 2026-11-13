import { ArrowLeft, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { RequirePermission } from "../components/RequirePermission";
import { DeptChip, EmploymentBadge, LeaveStatusBadge } from "../components/domain/Badges";
import { Button } from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";
import { Avatar, DescriptionList, Tabs } from "../components/ui/Misc";
import { EmptyState, QueryView } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { AttendanceHistoryTable } from "../modules/attendance/AttendanceHistoryTable";
import { EmployeeFormModal } from "../modules/employees/EmployeeFormModal";
import { TaskList } from "../modules/tasks/TaskList";
import { attendanceService, employeeService, leaveService, taskService } from "../services";
import type { Employee } from "../types";
import { addDays, formatDate, today } from "../utils/date";
import { fullName } from "../utils/format";
import { LEAVE_TYPE_LABEL } from "../utils/labels";
import { ROLE_LABELS } from "../utils/permissions";

type Tab = "tasks" | "attendance" | "leave";

export default function EmployeeDetailPage() {
  const { id = "" } = useParams();
  const { user } = useSession();
  const page = <EmployeeDetail id={id} />;
  // Everyone may view their own profile; other profiles need directory access.
  return id === user.id ? page : <RequirePermission permission="employees.view">{page}</RequirePermission>;
}

function EmployeeDetail({ id }: { id: string }) {
  const { can } = useSession();
  const dir = useDirectory();
  const q = useQuery(() => employeeService.get(id), [id]);
  const [tab, setTab] = useState<Tab>("tasks");
  const [editing, setEditing] = useState(false);

  return (
    <QueryView query={q}>
      {(e) => (
        <div className="space-y-5">
          <Link to="/employees" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ArrowLeft className="size-4" aria-hidden /> Employees
          </Link>
          <Card>
            <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar employee={e} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold text-slate-900">{fullName(e)}</h1>
                  <EmploymentBadge status={e.status} />
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{e.designation} · <span className="font-mono text-xs">{e.id}</span></p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                  <a href={`mailto:${e.email}`} className="inline-flex items-center gap-1.5 hover:text-slate-900"><Mail className="size-4" aria-hidden />{e.email}</a>
                  <a href={`tel:${e.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1.5 hover:text-slate-900"><Phone className="size-4" aria-hidden />{e.phone}</a>
                  <span className="inline-flex items-center gap-1.5"><MapPin className="size-4" aria-hidden />{e.location}</span>
                </div>
              </div>
              {can("employees.manage") && <Button variant="secondary" icon={Pencil} onClick={() => setEditing(true)}>Edit</Button>}
            </CardBody>
            <div className="border-t border-slate-100 px-4 py-4">
              <DescriptionList
                items={[
                  { label: "Department", value: <DeptChip department={dir.department(e.departmentId)} /> },
                  { label: "Role", value: ROLE_LABELS[e.role] },
                  { label: "Joining date", value: formatDate(e.joiningDate) },
                  { label: "Reports to", value: headOf(e, dir) },
                ]}
              />
            </div>
          </Card>

          <Card>
            <div className="px-4 pt-2">
              <Tabs<Tab> label="Employee records" value={tab} onChange={setTab} tabs={[{ id: "tasks", label: "Tasks" }, { id: "attendance", label: "Attendance" }, { id: "leave", label: "Leave" }]} />
            </div>
            {tab === "tasks" && <EmployeeTasks id={e.id} />}
            {tab === "attendance" && <EmployeeAttendance id={e.id} />}
            {tab === "leave" && <EmployeeLeave id={e.id} />}
          </Card>

          {editing && <EmployeeFormModal open onClose={() => setEditing(false)} employee={e} departments={dir.departments} />}
        </div>
      )}
    </QueryView>
  );
}

function headOf(e: Employee, dir: ReturnType<typeof useDirectory>) {
  const head = dir.employee(dir.department(e.departmentId)?.headId);
  if (!head || head.id === e.id) return "—";
  return <Link to={`/employees/${head.id}`} className="text-brand-700 hover:underline">{fullName(head)}</Link>;
}

function EmployeeTasks({ id }: { id: string }) {
  const dir = useDirectory();
  const q = useQuery(() => taskService.list({ employeeId: id }), [id]);
  return <QueryView query={q}>{(tasks) => <TaskList tasks={tasks} dir={dir} showAssignee={false} />}</QueryView>;
}

function EmployeeAttendance({ id }: { id: string }) {
  const q = useQuery(() => attendanceService.list({ employeeId: id, from: addDays(today(), -30), to: today() }), [id]);
  return <QueryView query={q}>{(recs) => <AttendanceHistoryTable records={recs} />}</QueryView>;
}

function EmployeeLeave({ id }: { id: string }) {
  const q = useQuery(() => leaveService.list({ employeeId: id }), [id]);
  return (
    <QueryView query={q}>
      {(leaves) =>
        leaves.length === 0 ? (
          <EmptyState title="No leave requests" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {leaves.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium text-slate-900">{LEAVE_TYPE_LABEL[l.type]} leave · {l.days} day(s)</p>
                  <p className="text-xs text-slate-500">{formatDate(l.startDate)} – {formatDate(l.endDate)} · {l.reason}</p>
                </div>
                <LeaveStatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        )
      }
    </QueryView>
  );
}
