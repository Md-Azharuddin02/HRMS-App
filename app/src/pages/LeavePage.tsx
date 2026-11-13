import { CalendarPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Select } from "../components/form/Field";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SearchInput } from "../components/ui/DataTable";
import { PageHeader, Progress, Tabs } from "../components/ui/Misc";
import { ConfirmDialog } from "../components/ui/Modal";
import { QueryView, Skeleton } from "../components/ui/States";
import { useDirectory } from "../hooks/useDirectory";
import { useMutation } from "../hooks/useMutation";
import { useQuery } from "../hooks/useQuery";
import { useSession } from "../hooks/useSession";
import { LeaveFormModal } from "../modules/leave/LeaveFormModal";
import { LeaveTable } from "../modules/leave/LeaveTable";
import { ReviewLeaveModal } from "../modules/leave/ReviewLeaveModal";
import { leaveService } from "../services";
import type { LeaveRequest, LeaveStatus } from "../types";
import { fullName, pct } from "../utils/format";
import { LEAVE_STATUS_LABEL, LEAVE_TYPE_LABEL } from "../utils/labels";

type Tab = "mine" | "approvals" | "history";

export default function LeavePage() {
  const { user, can, scope } = useSession();
  const dir = useDirectory();
  const [params, setParams] = useSearchParams();
  const approver = can("leaves.approve");
  const tab = (approver && (params.get("tab") as Tab)) || "mine";
  const balances = useQuery(() => leaveService.balances(user.id), [user.id]);
  const mine = useQuery(() => leaveService.list({ employeeId: user.id }), [user.id]);
  const team = useQuery(() => (approver ? leaveService.list(scope) : Promise.resolve([])), [approver, scope.departmentId]);
  const [applying, setApplying] = useState(false);
  const [reviewing, setReviewing] = useState<{ req: LeaveRequest; decision: "approved" | "rejected" } | null>(null);
  const [withdrawing, setWithdrawing] = useState<LeaveRequest | null>(null);
  const withdraw = useMutation();

  const pending = (team.data ?? []).filter((l) => l.status === "pending" && l.employeeId !== user.id);

  return (
    <>
      <PageHeader
        title={approver ? "Leave" : "My Leave"}
        description="Apply for time off, track balances and review requests."
        actions={<Button icon={CalendarPlus} onClick={() => setApplying(true)} disabled={!balances.data}>Apply for leave</Button>}
      />

      <QueryView query={balances} skeleton={<div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        {(bals) => (
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {bals.map((b) => (
              <div key={b.type} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-xs font-medium text-slate-500">{LEAVE_TYPE_LABEL[b.type]} leave</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                  {b.allowance === null ? b.used : b.allowance - b.used}
                  <span className="ml-1 text-sm font-normal text-slate-500">{b.allowance === null ? "used" : `of ${b.allowance} left`}</span>
                </p>
                {b.allowance !== null && <Progress className="mt-2" value={pct(b.used, b.allowance)} label={`${LEAVE_TYPE_LABEL[b.type]} leave used`} />}
                {b.pending > 0 && <p className="mt-1.5 text-xs text-amber-700">{b.pending} day(s) pending approval</p>}
              </div>
            ))}
          </div>
        )}
      </QueryView>

      {approver && (
        <div className="mb-4">
          <Tabs<Tab>
            label="Leave view"
            value={tab}
            onChange={(t) => setParams(t === "mine" ? {} : { tab: t }, { replace: true })}
            tabs={[
              { id: "mine", label: "My requests" },
              { id: "approvals", label: "Approvals", count: pending.length },
              { id: "history", label: "Team history" },
            ]}
          />
        </div>
      )}

      <Card>
        {tab === "mine" && (
          <QueryView query={mine}>
            {(list) => <LeaveTable leaves={list} dir={dir} onWithdraw={setWithdrawing} emptyMessage="You haven't applied for leave yet." />}
          </QueryView>
        )}
        {tab === "approvals" && (
          <QueryView query={team}>
            {() => <LeaveTable leaves={pending} dir={dir} showEmployee onReview={(req, decision) => setReviewing({ req, decision })} emptyMessage="No requests waiting for your review." />}
          </QueryView>
        )}
        {tab === "history" && <QueryView query={team}>{(list) => <TeamHistory leaves={list} dir={dir} />}</QueryView>}
      </Card>

      {applying && balances.data && <LeaveFormModal open onClose={() => setApplying(false)} balances={balances.data} />}
      {reviewing && <ReviewLeaveModal request={reviewing.req} decision={reviewing.decision} employee={dir.employee(reviewing.req.employeeId)} onClose={() => setReviewing(null)} />}
      <ConfirmDialog
        open={!!withdrawing}
        title="Withdraw this leave request?"
        message="The request will be removed and approvers will no longer see it."
        confirmLabel="Withdraw"
        danger
        loading={withdraw.pending}
        onClose={() => setWithdrawing(null)}
        onConfirm={async () => {
          await withdraw.run(() => leaveService.cancel(withdrawing!.id), "Leave request withdrawn");
          setWithdrawing(null);
        }}
      />
    </>
  );
}

function TeamHistory({ leaves, dir }: { leaves: LeaveRequest[]; dir: ReturnType<typeof useDirectory> }) {
  const [status, setStatus] = useState<LeaveStatus | "">("");
  const [query, setQuery] = useState("");
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return leaves.filter((l) => (!status || l.status === status) && (!q || fullName(dir.employee(l.employeeId)).toLowerCase().includes(q)));
  }, [leaves, status, query, dir]);
  return (
    <>
      <div className="flex flex-wrap gap-2 border-b border-slate-100 p-3">
        <SearchInput value={query} onChange={setQuery} placeholder="Search employee…" className="w-full sm:w-60" />
        <Select value={status} onChange={(e) => setStatus(e.target.value as LeaveStatus | "")} aria-label="Filter by status" className="w-full sm:w-40">
          <option value="">All statuses</option>
          {(Object.keys(LEAVE_STATUS_LABEL) as LeaveStatus[]).map((s) => <option key={s} value={s}>{LEAVE_STATUS_LABEL[s]}</option>)}
        </Select>
      </div>
      <LeaveTable key={status + query} leaves={rows} dir={dir} showEmployee />
    </>
  );
}
