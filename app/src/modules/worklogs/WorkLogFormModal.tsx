import { Field, Input, Textarea } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { useForm, type Errors } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { workLogService } from "../../services";
import type { WorkLog } from "../../types";
import { today } from "../../utils/date";

interface FormValues {
  date: string;
  hours: string;
  completed: string;
  ongoing: string;
  blockers: string;
  remarks: string;
}

const lines = (s: string) => s.split("\n").map((x) => x.trim()).filter(Boolean);

function validate(v: FormValues): Errors<FormValues> {
  const h = Number(v.hours);
  return {
    date: !v.date ? "Date is required" : v.date > today() ? "Can't log future dates" : undefined,
    hours: !v.hours || Number.isNaN(h) || h <= 0 || h > 16 ? "Enter hours between 0.25 and 16" : undefined,
    completed: !lines(v.completed).length && !lines(v.ongoing).length ? "Add at least one completed or ongoing item" : undefined,
  };
}

/** Submit or edit a daily work report. Saving the same date again updates that day's log. */
export function WorkLogFormModal({ open, onClose, employeeId, existing, suggestedHours }: { open: boolean; onClose: () => void; employeeId: string; existing?: WorkLog; suggestedHours?: number }) {
  const form = useForm<FormValues>(
    existing
      ? { date: existing.date, hours: String(existing.hours), completed: existing.completed.join("\n"), ongoing: existing.ongoing.join("\n"), blockers: existing.blockers, remarks: existing.remarks }
      : { date: today(), hours: suggestedHours ? String(Math.round(suggestedHours * 4) / 4) : "8", completed: "", ongoing: "", blockers: "", remarks: "" },
    validate,
  );
  const { run, pending } = useMutation();
  const { values: v, errors: e, set } = form;

  const submit = form.handleSubmit(async (x) => {
    const ok = await run(
      () => workLogService.save({ employeeId, date: x.date, hours: Number(x.hours), completed: lines(x.completed), ongoing: lines(x.ongoing), blockers: x.blockers.trim(), remarks: x.remarks.trim() }),
      existing ? "Work log updated" : "Work log submitted",
    );
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={existing ? "Edit work log" : "Daily work report"}
      description="One item per line. Submitting again for the same date replaces that day's log."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="worklog-form" loading={pending}>{existing ? "Save changes" : "Submit log"}</Button>
        </>
      }
    >
      <form id="worklog-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Date" required error={e.date}><Input type="date" max={today()} value={v.date} disabled={!!existing} onChange={(x) => set("date", x.target.value)} /></Field>
        <Field label="Hours worked" required error={e.hours}><Input type="number" min={0.25} max={16} step={0.25} value={v.hours} onChange={(x) => set("hours", x.target.value)} /></Field>
        <Field label="Completed activities" error={e.completed} className="sm:col-span-2"><Textarea rows={4} value={v.completed} onChange={(x) => set("completed", x.target.value)} placeholder={"Fixed login redirect bug\nReviewed 2 pull requests"} /></Field>
        <Field label="Ongoing tasks" className="sm:col-span-2"><Textarea rows={3} value={v.ongoing} onChange={(x) => set("ongoing", x.target.value)} placeholder="Dashboard performance work" /></Field>
        <Field label="Blockers" hint="Anything stopping you? Leave empty if none." className="sm:col-span-2"><Textarea rows={2} value={v.blockers} onChange={(x) => set("blockers", x.target.value)} /></Field>
        <Field label="Remarks" className="sm:col-span-2"><Textarea rows={2} value={v.remarks} onChange={(x) => set("remarks", x.target.value)} /></Field>
      </form>
    </Modal>
  );
}
