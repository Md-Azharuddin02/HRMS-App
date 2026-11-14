import { Coffee, LogIn, LogOut, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { AttendanceBadge, BreakTypeBadge, SessionBadge } from "../../components/domain/Badges";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/Modal";
import { ErrorState, Skeleton } from "../../components/ui/States";
import { useSession } from "../../hooks/useSession";
import type { AttendanceRecord } from "../../types";
import { formatMinutes, openBreak, sessionTotals } from "../../utils/attendance";
import { formatDate, formatTime, today } from "../../utils/date";
import { BREAK_TYPE_LABEL } from "../../utils/labels";
import { useAttendanceSession } from "./session/context";

/** Re-render every `ms` so running timers stay current. */
function useNow(ms = 10_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

const BREAK_REASON = {
  manual: "You started this break.",
  inactivity: "Started automatically after a period without activity.",
  tab_closed: "Started automatically because WorkforceHub was closed.",
};

/** Today's continuous attendance session with context-sensitive actions. */
export function ClockCard({ showHistory = false }: { showHistory?: boolean }) {
  const { settings } = useSession();
  const { record: r, state, error, pending, lastActivity, reload, checkIn, startBreak, resume, checkOut } = useAttendanceSession();
  const [confirmOut, setConfirmOut] = useState(false);
  const now = useNow();
  const totals = r ? sessionTotals(r, now) : null;
  const active = openBreak(r);
  const onLeave = r?.status === "on_leave" && !r.checkIn;

  return (
    <Card>
      <CardHeader
        title="Today"
        description={`${formatDate(today())} · workday ${settings.workStartTime}–${settings.workEndTime}`}
        actions={
          <div className="flex items-center gap-1.5">
            {r?.checkIn && <AttendanceBadge status={r.status} />}
            <SessionBadge state={state} />
          </div>
        }
      />
      <CardBody>
        {error && r === undefined ? (
          <ErrorState message={error} onRetry={reload} />
        ) : r === undefined ? (
          <Skeleton className="h-28 w-full" />
        ) : (
          <>
            {state === "on_break" && active && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3" aria-live="polite">
                <div>
                  <p className="font-semibold text-amber-900">On break since {formatTime(active.start)} · {formatMinutes((now.getTime() - new Date(active.start).getTime()) / 60_000)}</p>
                  <p className="mt-0.5 text-sm text-amber-800">{BREAK_REASON[active.type]} Your attendance session is still open.</p>
                </div>
                <Button size="lg" icon={Play} loading={pending} onClick={resume}>Resume work</Button>
              </div>
            )}

            <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Metric label="Check in" value={formatTime(r?.checkIn)} />
              <Metric label="Session" value={totals ? formatMinutes(totals.sessionMinutes) : "—"} />
              <Metric label="Net working" value={totals ? formatMinutes(totals.workingMinutes) : "—"} strong />
              <Metric label="Breaks" value={totals ? `${formatMinutes(totals.breakMinutes)} · ${totals.breaks}` : "—"} />
              <Metric label="Last activity" value={r?.checkIn && !r.checkOut ? formatTime(new Date(lastActivity).toISOString()) : formatTime(r?.lastActivityAt)} />
              <Metric label="Check out" value={formatTime(r?.checkOut)} />
            </dl>

            {r?.status === "late" && (
              <p className="mt-3 text-xs text-amber-700">Checked in after {settings.workStartTime} (+{settings.lateGraceMinutes} min grace), so today is marked late.</p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {onLeave && <p className="text-sm text-slate-600">You're on approved leave today.</p>}
              {state === "not_checked_in" && !onLeave && (
                <Button size="lg" icon={LogIn} loading={pending} onClick={checkIn}>Check in</Button>
              )}
              {state === "working" && (
                <>
                  <Button variant="secondary" icon={Coffee} loading={pending} onClick={startBreak}>Start break</Button>
                  <Button icon={LogOut} onClick={() => setConfirmOut(true)}>Check out</Button>
                  <p className="text-xs text-slate-500">
                    Inactive for {settings.inactivityBreakMinutes} min or closing the app records a break. Closing never checks you out.
                  </p>
                </>
              )}
              {state === "checked_out" && <p className="text-sm text-slate-600">You checked out at {formatTime(r?.checkOut)}. See you tomorrow!</p>}
              {state === "auto_checked_out" && (
                <p className="text-sm text-slate-600">Your session closed automatically at the end of the workday ({formatTime(r?.checkOut)}).</p>
              )}
            </div>

            {showHistory && r && r.breaks.length > 0 && <BreakHistory record={r} now={now} />}
          </>
        )}
      </CardBody>
      <ConfirmDialog
        open={confirmOut}
        title="Check out for today?"
        message={`You've worked ${totals ? formatMinutes(totals.workingMinutes) : "0h"} today. This ends today's attendance session; you won't be able to check in or resume again until tomorrow.`}
        confirmLabel="Check out"
        loading={pending}
        onClose={() => setConfirmOut(false)}
        onConfirm={async () => {
          await checkOut();
          setConfirmOut(false);
        }}
      />
    </Card>
  );
}

function BreakHistory({ record, now }: { record: AttendanceRecord; now: Date }) {
  return (
    <div className="mt-5">
      <h3 className="mb-2 text-sm font-semibold text-slate-900">Breaks today</h3>
      <table className="w-full text-sm">
        <thead className="text-left text-xs text-slate-500">
          <tr>
            <th className="py-1.5 font-medium">#</th>
            <th className="py-1.5 font-medium">Reason</th>
            <th className="py-1.5 font-medium">Started</th>
            <th className="py-1.5 font-medium">Ended</th>
            <th className="py-1.5 text-right font-medium">Duration</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {record.breaks.map((b, i) => (
            <tr key={b.id}>
              <td className="py-1.5 tabular-nums text-slate-500">{i + 1}</td>
              <td className="py-1.5"><BreakTypeBadge type={b.type} /><span className="sr-only"> {BREAK_TYPE_LABEL[b.type]}</span></td>
              <td className="py-1.5 tabular-nums">{formatTime(b.start)}</td>
              <td className="py-1.5 tabular-nums">{b.end ? formatTime(b.end) : <span className="text-amber-700">On break</span>}</td>
              <td className="py-1.5 text-right tabular-nums">{formatMinutes(((b.end ? new Date(b.end) : now).getTime() - new Date(b.start).getTime()) / 60_000)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Metric({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className={`mt-0.5 tabular-nums text-slate-900 ${strong ? "font-bold" : "font-semibold"}`}>{value}</dd>
    </div>
  );
}
