import { AlarmClock, CalendarCheck, Clock, Timer } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader } from "../components/ui/Card";
import { PageHeader, StatCard, Tabs } from "../components/ui/Misc";
import { QueryView } from "../components/ui/States";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { AttendanceHistoryTable } from "../modules/attendance/AttendanceHistoryTable";
import { ClockCard } from "../modules/attendance/ClockCard";
import { TeamAttendance } from "../modules/attendance/TeamAttendance";
import { attendanceService } from "../services";
import { isPresentStatus, workedHours } from "../utils/attendance";
import { addDays, formatHours, today } from "../utils/date";

type Tab = "mine" | "team";

export default function AttendancePage() {
  const { can, scope } = useSession();
  const [tab, setTab] = useState<Tab>(can("attendance.viewAll") ? "team" : "mine");
  const showTeam = can("attendance.viewAll");

  return (
    <>
      <PageHeader title="Attendance" description="Check in and out, track breaks and review attendance history." />
      {showTeam && (
        <div className="mb-5">
          <Tabs<Tab>
            label="Attendance view"
            value={tab}
            onChange={setTab}
            tabs={[{ id: "team", label: scope.departmentId ? "My department" : "Team" }, { id: "mine", label: "My attendance" }]}
          />
        </div>
      )}
      {tab === "team" && showTeam ? (
        <Card>
          <TeamAttendance />
        </Card>
      ) : (
        <MyAttendance />
      )}
    </>
  );
}

function MyAttendance() {
  const { user } = useSession();
  const from = addDays(today(), -30);
  const q = useQuery(() => attendanceService.list({ employeeId: user.id, from, to: today() }), [user.id]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ClockCard showHistory />
        </div>
        <QueryView query={q}>
          {(recs) => {
            const worked = recs.filter((r) => isPresentStatus(r.status));
            const hours = worked.reduce((s, r) => s + workedHours(r), 0);
            return (
              <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                <StatCard label="Days present (30d)" value={worked.length} icon={CalendarCheck} tone="green" />
                <StatCard label="Late arrivals" value={recs.filter((r) => r.status === "late").length} icon={AlarmClock} tone="amber" />
                <StatCard label="Total hours" value={formatHours(hours)} icon={Clock} tone="teal" />
                <StatCard label="Avg per day" value={formatHours(worked.length ? hours / worked.length : 0)} icon={Timer} tone="blue" />
              </div>
            );
          }}
        </QueryView>
      </div>
      <Card>
        <CardHeader title="Attendance history" description="Last 30 days" />
        <QueryView query={q}>{(recs) => <AttendanceHistoryTable records={recs} />}</QueryView>
      </Card>
    </div>
  );
}
