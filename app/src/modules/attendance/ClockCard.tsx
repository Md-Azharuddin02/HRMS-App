import { Coffee, LogIn, LogOut, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendanceBadge } from "../../components/domain/Badges";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/Modal";
import { Skeleton } from "../../components/ui/States";
import { useMutation } from "../../hooks/useMutation";
import { useQuery } from "../../hooks/useQuery";
import { useSession } from "../../hooks/useSession";
import { attendanceService } from "../../services";
import { breakHours, liveState, workedHours } from "../../utils/attendance";
import { formatDate, formatHours, formatTime, today } from "../../utils/date";

const STATE_TEXT = { not_started: "Not checked in", working: "Working", on_break: "On break", checked_out: "Checked out" };
const STATE_DOT = { not_started: "bg-slate-300", working: "bg-emerald-500", on_break: "bg-amber-500", checked_out: "bg-slate-400" };

/** Re-render every `ms` so running timers stay current. */
function useNow(ms = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function ClockCard() {
  const { user, settings } = useSession();
  const rec = useQuery(() => attendanceService.getToday(), [user.id]);
  const { run, pending } = useMutation();
  const [confirmOut, setConfirmOut] = useState(false);
  const now = useNow();
  const state = liveState(rec.data);
  const r = rec.data;

  const act = (fn: () => Promise<unknown>, msg: string) => run(fn, msg);

  return (
    <Card>
      <CardHeader title="Today" description={`${formatDate(today())} · shift ${settings.workStartTime}–${settings.workEndTime}`} actions={r && <AttendanceBadge status={r.status} />} />
      <CardBody>
        {rec.data === undefined ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <>
            <div className="flex items-center gap-2 text-sm font-medium text-slate-900" aria-live="polite">
              <span className={`size-2.5 rounded-full ${STATE_DOT[state]}`} aria-hidden />
              {r?.status === "on_leave" ? "On approved leave" : STATE_TEXT[state]}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Check in" value={formatTime(r?.checkIn)} />
              <Metric label="Check out" value={formatTime(r?.checkOut)} />
              <Metric label="Break" value={r ? formatHours(breakHours(r, now)) : "—"} />
              <Metric label="Worked" value={r ? formatHours(workedHours(r, now)) : "—"} />
            </dl>
            {r?.status === "late" && (
              <p className="mt-3 text-xs text-amber-700">
                Checked in after {settings.workStartTime} (+{settings.lateGraceMinutes} min grace) — marked late.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {state === "not_started" && r?.status !== "on_leave" && (
                <Button icon={LogIn} loading={pending} onClick={() => act(attendanceService.checkIn, "Checked in")}>Check in</Button>
              )}
              {state === "working" && (
                <>
                  <Button variant="secondary" icon={Coffee} loading={pending} onClick={() => act(attendanceService.startBreak, "Break started")}>Start break</Button>
                  <Button variant="secondary" icon={LogOut} onClick={() => setConfirmOut(true)}>Check out</Button>
                </>
              )}
              {state === "on_break" && (
                <Button icon={Play} loading={pending} onClick={() => act(attendanceService.endBreak, "Break ended")}>End break</Button>
              )}
              {state === "checked_out" && <p className="text-sm text-slate-500">You're done for today. See you tomorrow!</p>}
            </div>
          </>
        )}
      </CardBody>
      <ConfirmDialog
        open={confirmOut}
        title="Check out for today?"
        message={`You've worked ${r ? formatHours(workedHours(r, now)) : "0h"} today. You won't be able to check in again until tomorrow.`}
        confirmLabel="Check out"
        loading={pending}
        onClose={() => setConfirmOut(false)}
        onConfirm={async () => {
          await act(attendanceService.checkOut, "Checked out");
          setConfirmOut(false);
        }}
      />
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-semibold tabular-nums text-slate-900">{value}</dd>
    </div>
  );
}
