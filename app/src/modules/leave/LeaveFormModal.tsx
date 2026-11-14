import { Field, Input, Select, Textarea } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { required, useForm, type Errors } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { leaveService } from "../../services";
import type { LeaveBalance, LeaveInput, LeaveType } from "../../types";
import { addDays, countWorkingDays, today } from "../../utils/date";
import { LEAVE_TYPES, LEAVE_TYPE_LABEL } from "../../utils/labels";

type Values = Omit<LeaveInput, "employeeId">;

export function LeaveFormModal({ open, onClose, balances }: { open: boolean; onClose: () => void; balances: LeaveBalance[] }) {
  const { settings } = useSession();
  const remaining = (t: LeaveType) => {
    const b = balances.find((x) => x.type === t);
    return !b || b.allowance === null ? Infinity : b.allowance - b.used - b.pending;
  };
  const days = (v: Values) => (v.startDate && v.endDate && v.endDate >= v.startDate ? countWorkingDays(v.startDate, v.endDate, settings.weekendDays) : 0);

  const validate = (v: Values): Errors<Values> => ({
    startDate: required(v.startDate, "Start date"),
    endDate: required(v.endDate, "End date") ?? (v.endDate < v.startDate ? "End date must be on or after start date" : days(v) === 0 ? "Selected dates are all weekend days" : undefined),
    reason: required(v.reason, "Reason") ?? (v.reason.trim().length < 5 ? "Please add a few more words" : undefined),
    type: days(v) > remaining(v.type) ? `Only ${remaining(v.type)} day(s) of ${LEAVE_TYPE_LABEL[v.type].toLowerCase()} leave left` : undefined,
  });

  const start = addDays(today(), 1);
  const form = useForm<Values>({ type: "casual", startDate: start, endDate: start, reason: "" }, validate);
  const { run, pending } = useMutation();
  const { values: v, errors: e, set } = form;
  const n = days(v);
  const left = remaining(v.type);

  const submit = form.handleSubmit(async (x) => {
    const ok = await run(() => leaveService.apply({ ...x, reason: x.reason.trim() }), "Leave request submitted for approval");
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply for leave"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="leave-form" loading={pending}>Submit request</Button>
        </>
      }
    >
      <form id="leave-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Leave type" required error={e.type} className="sm:col-span-2">
          <Select value={v.type} onChange={(x) => set("type", x.target.value as LeaveType)}>
            {LEAVE_TYPES.map((t) => (
              <option key={t} value={t}>
                {LEAVE_TYPE_LABEL[t]} {remaining(t) === Infinity ? "(no limit)" : `(${remaining(t)} left)`}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="From" required error={e.startDate}>
          <Input
            type="date"
            value={v.startDate}
            onChange={(x) => {
              set("startDate", x.target.value);
              if (v.endDate < x.target.value) set("endDate", x.target.value);
            }}
          />
        </Field>
        <Field label="To" required error={e.endDate}><Input type="date" min={v.startDate} value={v.endDate} onChange={(x) => set("endDate", x.target.value)} /></Field>
        <p className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700 sm:col-span-2" aria-live="polite">
          <strong>{n}</strong> working day(s){left !== Infinity && <> · {Math.max(0, left - n)} {LEAVE_TYPE_LABEL[v.type].toLowerCase()} day(s) would remain</>}
        </p>
        <Field label="Reason" required error={e.reason} className="sm:col-span-2"><Textarea rows={3} value={v.reason} onChange={(x) => set("reason", x.target.value)} /></Field>
      </form>
    </Modal>
  );
}
