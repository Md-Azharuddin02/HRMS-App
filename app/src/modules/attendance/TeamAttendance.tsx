import { useMemo, useState } from "react";
import { Field, Input, Select } from "../../components/form/Field";
import { SearchInput } from "../../components/ui/DataTable";
import { QueryView } from "../../components/ui/States";
import { useDirectory } from "../../hooks/useDirectory";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { attendanceService } from "../../services";
import type { AttendanceRecord, AttendanceStatus } from "../../types";
import { isWeekend, today } from "../../utils/date";
import { fullName } from "../../utils/format";
import { ATTENDANCE_LABEL } from "../../utils/labels";
import { AttendanceHistoryTable } from "./AttendanceHistoryTable";

/** Daily attendance status for everyone in scope, including people with no record (absent / not in yet). */
export function TeamAttendance() {
  const { scope, settings } = useSession();
  const dir = useDirectory();
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState<AttendanceStatus | "">("");
  const [query, setQuery] = useState("");
  const q = useQuery(() => attendanceService.list({ ...scope, from: date, to: date }), [date, scope.departmentId]);

  const rows = useMemo(() => {
    const recs = new Map((q.data ?? []).map((r) => [r.employeeId, r]));
    const people = dir.employees.filter((e) => e.status !== "inactive" && e.joiningDate <= date && (!scope.departmentId || e.departmentId === scope.departmentId));
    const all: AttendanceRecord[] = isWeekend(date, settings.weekendDays)
      ? [...recs.values()]
      : people.map((e) => recs.get(e.id) ?? { id: `none-${e.id}`, employeeId: e.id, date, checkIn: null, checkOut: null, breaks: [], status: "absent" });
    const needle = query.trim().toLowerCase();
    return all.filter((r) => (!status || r.status === status) && (!needle || fullName(dir.employee(r.employeeId)).toLowerCase().includes(needle)));
  }, [q.data, dir, date, scope.departmentId, settings.weekendDays, status, query]);

  const counts = (s: AttendanceStatus) => rows.filter((r) => r.status === s).length;

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3 border-b border-slate-100 p-3">
        <Field label="Date" className="w-full sm:w-44">
          <Input type="date" value={date} max={today()} onChange={(e) => e.target.value && setDate(e.target.value)} />
        </Field>
        <Field label="Status" className="w-full sm:w-40">
          <Select value={status} onChange={(e) => setStatus(e.target.value as AttendanceStatus | "")}>
            <option value="">All</option>
            {(Object.keys(ATTENDANCE_LABEL) as AttendanceStatus[]).map((s) => <option key={s} value={s}>{ATTENDANCE_LABEL[s]}</option>)}
          </Select>
        </Field>
        <SearchInput value={query} onChange={setQuery} placeholder="Search employee…" className="w-full sm:w-56" />
        <p className="text-xs text-slate-500 sm:ml-auto">
          {counts("present")} on time · {counts("late")} late · {counts("absent")} absent{date === today() ? " / not in yet" : ""} · {counts("on_leave")} on leave
        </p>
      </div>
      {isWeekend(date, settings.weekendDays) && <p className="px-4 pt-3 text-xs text-slate-500">This date is a weekend — only people who worked are listed.</p>}
      <QueryView query={q}>{() => <AttendanceHistoryTable key={date} records={rows} dir={dir} showEmployee pageSize={15} />}</QueryView>
    </div>
  );
}
