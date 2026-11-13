import { CalendarRange, CheckCircle2, Clock, Download, Printer, UserCheck } from "lucide-react";
import { useState } from "react";
import { Field, Input, Select } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { PageHeader, StatCard, Tabs } from "../components/ui/Misc";
import { QueryView, Skeleton } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { AttendanceTrendChart } from "../modules/dashboard/AttendanceTrendChart";
import { exportDepartmentCsv, exportEmployeeCsv } from "../modules/reports/exportReport";
import { DepartmentReportTable, EmployeeReportTable } from "../modules/reports/ReportTables";
import { reportService } from "../services";
import type { DateRange, Report } from "../types";
import { addDays, formatDate, formatHours, startOfMonth, startOfWeek, today } from "../utils/date";
import { fullName, pct } from "../utils/format";

type Period = "daily" | "weekly" | "monthly" | "custom";
type Tab = "employees" | "departments";

function rangeFor(p: Period, custom: DateRange): DateRange {
  const t = today();
  if (p === "daily") return { from: t, to: t };
  if (p === "weekly") return { from: startOfWeek(t), to: t };
  if (p === "monthly") return { from: startOfMonth(t), to: t };
  return custom;
}

export default function ReportsPage() {
  const { scope } = useSession();
  const dir = useDirectory();
  const [period, setPeriod] = useState<Period>("monthly");
  const [custom, setCustom] = useState<DateRange>({ from: addDays(today(), -29), to: today() });
  const [dept, setDept] = useState(scope.departmentId ?? "");
  const [person, setPerson] = useState("");
  const [tab, setTab] = useState<Tab>("employees");
  const range = rangeFor(period, custom);
  const q = useQuery(
    () => reportService.report(range, { departmentId: dept || undefined, employeeId: person || undefined }),
    [range.from, range.to, dept, person],
  );
  const people = dir.employees.filter((e) => !dept || e.departmentId === dept);

  return (
    <>
      <PageHeader
        title="Reports"
        description={`${formatDate(range.from)} – ${formatDate(range.to)}`}
        actions={
          <div className="no-print flex flex-wrap gap-2">
            <Button variant="secondary" icon={Download} disabled={!q.data} onClick={() => q.data && (tab === "employees" ? exportEmployeeCsv(q.data, dir.departments) : exportDepartmentCsv(q.data))}>Export CSV</Button>
            <Button variant="secondary" icon={Printer} onClick={() => window.print()}>Print / PDF</Button>
          </div>
        }
      />

      <Card className="no-print mb-5 flex flex-wrap items-end gap-3 p-3">
        <div role="group" aria-label="Report period" className="flex rounded-md border border-slate-300 bg-white p-0.5">
          {(["daily", "weekly", "monthly", "custom"] as Period[]).map((p) => (
            <button key={p} type="button" aria-pressed={period === p} onClick={() => setPeriod(p)} className={`rounded px-3 py-1.5 text-xs font-medium capitalize ${period === p ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              {p}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <>
            <Field label="From" className="w-full sm:w-40"><Input type="date" value={custom.from} max={custom.to} onChange={(e) => e.target.value && setCustom((c) => ({ ...c, from: e.target.value }))} /></Field>
            <Field label="To" className="w-full sm:w-40"><Input type="date" value={custom.to} min={custom.from} max={today()} onChange={(e) => e.target.value && setCustom((c) => ({ ...c, to: e.target.value }))} /></Field>
          </>
        )}
        {!scope.departmentId && (
          <Field label="Department" className="w-full sm:w-44">
            <Select value={dept} onChange={(e) => { setDept(e.target.value); setPerson(""); }}>
              <option value="">All departments</option>
              {dir.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Employee" className="w-full sm:w-48">
          <Select value={person} onChange={(e) => setPerson(e.target.value)}>
            <option value="">Everyone</option>
            {people.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
          </Select>
        </Field>
      </Card>

      <QueryView query={q} skeleton={<Skeleton className="h-96 w-full" />}>
        {(r) => (
          <div className="space-y-5">
            <Summary report={r} />
            <Card>
              <CardHeader title="Attendance over the period" />
              <CardBody>
                {r.trend.length ? <AttendanceTrendChart data={r.trend} height={240} /> : <p className="py-10 text-center text-sm text-slate-500">No working days in this range.</p>}
              </CardBody>
            </Card>
            <Card>
              <div className="px-4 pt-2">
                <Tabs<Tab> label="Report breakdown" value={tab} onChange={setTab} tabs={[{ id: "employees", label: "Employee-wise", count: r.employees.length }, { id: "departments", label: "Department-wise", count: r.departments.length }]} />
              </div>
              {tab === "employees" ? <EmployeeReportTable rows={r.employees} dir={dir} /> : <DepartmentReportTable rows={r.departments} dir={dir} />}
            </Card>
          </div>
        )}
      </QueryView>
    </>
  );
}

function Summary({ report }: { report: Report }) {
  const e = report.employees;
  const present = e.reduce((s, r) => s + r.presentDays, 0);
  const expected = e.reduce((s, r) => s + r.presentDays + r.absentDays, 0);
  const hours = e.reduce((s, r) => s + r.totalHours, 0);
  const assigned = e.reduce((s, r) => s + r.tasksAssigned, 0);
  const done = e.reduce((s, r) => s + r.tasksCompleted, 0);
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Working days" value={report.workingDays} icon={CalendarRange} />
      <StatCard label="Attendance rate" value={`${pct(present, expected)}%`} icon={UserCheck} tone="green" hint={`${e.reduce((s, r) => s + r.lateDays, 0)} late arrivals`} />
      <StatCard label="Hours worked" value={formatHours(hours)} icon={Clock} tone="teal" hint={`${formatHours(present ? hours / present : 0)} avg per day`} />
      <StatCard label="Task completion" value={`${pct(done, assigned)}%`} icon={CheckCircle2} tone="blue" hint={`${done} of ${assigned} tasks due in range`} />
    </div>
  );
}
