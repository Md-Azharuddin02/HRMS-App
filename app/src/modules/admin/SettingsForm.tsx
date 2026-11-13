import { Save } from "lucide-react";
import { Field, Input } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { required, useForm, type Errors } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { settingsService } from "../../services";
import type { AppSettings } from "../../types";
import { cn } from "../../utils/format";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function validate(v: AppSettings): Errors<AppSettings> {
  return {
    companyName: required(v.companyName, "Company name"),
    workEndTime: v.workEndTime <= v.workStartTime ? "End time must be after start time" : undefined,
    standardHours: v.standardHours > 0 && v.standardHours <= 24 ? undefined : "Enter 1–24 hours",
    lateGraceMinutes: v.lateGraceMinutes >= 0 && v.lateGraceMinutes <= 240 ? undefined : "Enter 0–240 minutes",
    weekendDays: v.weekendDays.length < 7 ? undefined : "At least one working day is required",
  };
}

/** Company, working-hours and leave policy settings. */
export function SettingsForm({ initial }: { initial: AppSettings }) {
  const { can } = useSession();
  const editable = can("settings.manage");
  const form = useForm<AppSettings>(initial, validate);
  const { run, pending } = useMutation();
  const { values: v, errors: e, set } = form;
  const num = (s: string) => (s === "" ? NaN : Number(s));

  return (
    <form onSubmit={form.handleSubmit((x) => run(() => settingsService.update(x), "Settings saved"))} noValidate>
      <fieldset disabled={!editable} className="space-y-5">
        <Card>
          <CardHeader title="Company" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" required error={e.companyName}><Input value={v.companyName} onChange={(x) => set("companyName", x.target.value)} /></Field>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Working hours" description="Used to mark late arrivals and compute expected hours." />
          <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Shift start" required><Input type="time" value={v.workStartTime} onChange={(x) => set("workStartTime", x.target.value)} /></Field>
            <Field label="Shift end" required error={e.workEndTime}><Input type="time" value={v.workEndTime} onChange={(x) => set("workEndTime", x.target.value)} /></Field>
            <Field label="Late grace period (min)" error={e.lateGraceMinutes}><Input type="number" min={0} max={240} value={Number.isNaN(v.lateGraceMinutes) ? "" : v.lateGraceMinutes} onChange={(x) => set("lateGraceMinutes", num(x.target.value))} /></Field>
            <Field label="Standard hours / day" error={e.standardHours}><Input type="number" min={1} max={24} step={0.5} value={Number.isNaN(v.standardHours) ? "" : v.standardHours} onChange={(x) => set("standardHours", num(x.target.value))} /></Field>
            <fieldset className="sm:col-span-2 lg:col-span-4">
              <legend className="mb-1 text-xs font-medium text-slate-700">Weekly off days</legend>
              <div className="flex flex-wrap gap-1.5">
                {DAYS.map((d, i) => {
                  const on = v.weekendDays.includes(i);
                  return (
                    <button
                      key={d}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set("weekendDays", on ? v.weekendDays.filter((x) => x !== i) : [...v.weekendDays, i].sort())}
                      className={cn("h-8 w-12 rounded-md border text-xs font-medium", on ? "border-brand-600 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600 hover:bg-slate-50")}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
              {e.weekendDays && <p className="mt-1 text-xs text-red-600">{e.weekendDays}</p>}
            </fieldset>
          </CardBody>
        </Card>
        <Card>
          <CardHeader title="Leave policy" description="Annual allowance per employee. Unpaid leave has no limit." />
          <CardBody className="grid gap-4 sm:grid-cols-3">
            {(["casual", "sick", "earned"] as const).map((t) => (
              <Field key={t} label={`${t[0].toUpperCase()}${t.slice(1)} leave (days)`}>
                <Input type="number" min={0} max={60} value={v.leaveAllowances[t]} onChange={(x) => set("leaveAllowances", { ...v.leaveAllowances, [t]: Math.max(0, Number(x.target.value) || 0) })} />
              </Field>
            ))}
          </CardBody>
        </Card>
        {editable && (
          <div className="flex justify-end">
            <Button type="submit" icon={Save} loading={pending}>Save settings</Button>
          </div>
        )}
      </fieldset>
    </form>
  );
}
