import { ClipboardList, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Field, Input, Select } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader, Tabs } from "../components/ui/Misc";
import { ConfirmDialog } from "../components/ui/Modal";
import { EmptyState, QueryView } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useMutation } from "../hooks/useMutation";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { WorkLogCard } from "../modules/worklogs/WorkLogCard";
import { WorkLogFormModal } from "../modules/worklogs/WorkLogFormModal";
import { attendanceService, workLogService } from "../services";
import type { WorkLog } from "../types";
import { workedHours } from "../utils/attendance";
import { addDays, today } from "../utils/date";
import { fullName } from "../utils/format";

type Tab = "mine" | "team";
const PAGE = 6;

export default function WorkLogsPage() {
  const { can, user } = useSession();
  const showTeam = can("worklogs.viewAll");
  const [tab, setTab] = useState<Tab>("mine");
  const [form, setForm] = useState<{ existing?: WorkLog } | null>(null);
  const todayRec = useQuery(() => attendanceService.getToday(), [user.id]);
  const mineToday = useQuery(() => workLogService.list({ employeeId: user.id, from: today(), to: today() }), [user.id]);
  const submittedToday = mineToday.data?.[0];

  return (
    <>
      <PageHeader
        title="Work Logs"
        description="Daily reports of what was done, what's in progress and what's blocked."
        actions={
          <Button icon={Plus} onClick={() => setForm(submittedToday ? { existing: submittedToday } : {})}>
            {submittedToday ? "Edit today's log" : "Submit today's log"}
          </Button>
        }
      />
      {showTeam && (
        <div className="mb-5">
          <Tabs<Tab> label="Work log view" value={tab} onChange={setTab} tabs={[{ id: "mine", label: "My logs" }, { id: "team", label: "Team logs" }]} />
        </div>
      )}
      {tab === "team" && showTeam ? <LogFeed team /> :<LogFeed onEdit={(log) => setForm({ existing: log })} />}

      {form && (
        <WorkLogFormModal
          key={form.existing?.id ?? "new"}
          open
          onClose={() => setForm(null)}
          existing={form.existing}
          suggestedHours={todayRec.data ? workedHours(todayRec.data) : undefined}
        />
      )}
    </>
  );
}

function LogFeed({ team, onEdit }: { team?: boolean; onEdit?: (log: WorkLog) => void }) {
  const { user, scope } = useSession();
  const dir = useDirectory();
  const [from, setFrom] = useState(addDays(today(), -14));
  const [to, setTo] = useState(today());
  const [person, setPerson] = useState("");
  const [blockedOnly, setBlockedOnly] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [deleting, setDeleting] = useState<WorkLog | null>(null);
  const del = useMutation();
  const q = useQuery(
    () => workLogService.list(team ? { ...scope, from, to } : { employeeId: user.id, from, to }),
    [team, from, to, user.id, scope.departmentId],
  );

  const logs = useMemo(
    () => (q.data ?? []).filter((l) => (!person || l.employeeId === person) && (!blockedOnly || l.blockers)),
    [q.data, person, blockedOnly],
  );
  const people = dir.employees.filter((e) => !scope.departmentId || e.departmentId === scope.departmentId);

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-3 p-3">
        <Field label="From" className="w-full sm:w-40"><Input type="date" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} /></Field>
        <Field label="To" className="w-full sm:w-40"><Input type="date" value={to} min={from} max={today()} onChange={(e) => e.target.value && setTo(e.target.value)} /></Field>
        {team && (
          <Field label="Employee" className="w-full sm:w-52">
            <Select value={person} onChange={(e) => setPerson(e.target.value)}>
              <option value="">Everyone</option>
              {people.map((p) => <option key={p.id} value={p.id}>{fullName(p)}</option>)}
            </Select>
          </Field>
        )}
        <label className="flex h-9 items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={blockedOnly} onChange={(e) => setBlockedOnly(e.target.checked)} className="size-4 rounded border-slate-300 accent-brand-600" />
          Only with blockers
        </label>
      </Card>

      <QueryView query={q}>
        {() =>
          logs.length === 0 ? (
            <Card>
              <EmptyState icon={ClipboardList} title="No work logs" message="Nothing submitted for this period and filter." />
            </Card>
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-2">
                {logs.slice(0, limit).map((l) => (
                  <WorkLogCard
                    key={l.id}
                    log={l}
                    employee={team ? dir.employee(l.employeeId) : undefined}
                    onEdit={l.employeeId === user.id && onEdit ? () => onEdit(l) : undefined}
                    onDelete={l.employeeId === user.id && !team ? () => setDeleting(l) : undefined}
                  />
                ))}
              </div>
              {logs.length > limit && (
                <div className="flex justify-center">
                  <Button variant="secondary" onClick={() => setLimit((n) => n + PAGE)}>Show more ({logs.length - limit} remaining)</Button>
                </div>
              )}
            </>
          )
        }
      </QueryView>

      <ConfirmDialog
        open={!!deleting}
        danger
        title="Delete work log?"
        message="This removes the report for that day. You can submit a new one afterwards."
        confirmLabel="Delete"
        loading={del.pending}
        onClose={() => setDeleting(null)}
        onConfirm={async () => {
          await del.run(() => workLogService.remove(deleting!.id), "Work log deleted");
          setDeleting(null);
        }}
      />
    </div>
  );
}
