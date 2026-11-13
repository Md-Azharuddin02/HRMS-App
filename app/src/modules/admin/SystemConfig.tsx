import { Database, RefreshCw, Save } from "lucide-react";
import { useState } from "react";
import { Field, Input, Select } from "../../components/form/Field";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/Modal";
import { useForm } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { settingsService } from "../../services";
import type { AppSettings } from "../../types";

type Values = Pick<AppSettings, "apiBaseUrl" | "timezone" | "dateFormat" | "emailNotifications">;
const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York", "UTC"];

/** Integration and environment settings. The API URL is stored only — no requests are made until a backend is wired in. */
export function SystemConfig({ initial }: { initial: AppSettings }) {
  const { can } = useSession();
  const editable = can("settings.manage");
  const form = useForm<Values>(
    { apiBaseUrl: initial.apiBaseUrl, timezone: initial.timezone, dateFormat: initial.dateFormat, emailNotifications: initial.emailNotifications },
    (v) => ({ apiBaseUrl: v.apiBaseUrl && !/^https:\/\/\S+$/.test(v.apiBaseUrl) ? "Use a full https:// URL" : undefined }),
  );
  const save = useMutation();
  const reset = useMutation();
  const [confirmReset, setConfirmReset] = useState(false);
  const { values: v, errors: e, set } = form;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Data source" actions={<Badge tone="amber"><Database className="size-3" aria-hidden />Mock data</Badge>} />
        <CardBody className="space-y-2 text-sm text-slate-600">
          <p>All screens read and write through the service layer in <code className="rounded bg-slate-100 px-1 text-xs">src/services</code>. Right now those services use in-browser mock data that resets daily.</p>
          <p>To go live, replace each service's implementation with calls to your API while keeping the contracts in <code className="rounded bg-slate-100 px-1 text-xs">src/services/contracts.ts</code>.</p>
        </CardBody>
      </Card>

      <form onSubmit={form.handleSubmit((x) => save.run(() => settingsService.update(x), "Configuration saved"))} noValidate>
        <Card>
          <CardHeader title="System configuration" />
          <fieldset disabled={!editable}>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="API base URL" error={e.apiBaseUrl} hint="Saved for later. Not used by the mock services." className="sm:col-span-2">
                <Input type="url" value={v.apiBaseUrl} onChange={(x) => set("apiBaseUrl", x.target.value.trim())} placeholder="https://script.google.com/macros/s/…/exec" />
              </Field>
              <Field label="Timezone" hint="Sent to the backend; the browser shows local time.">
                <Select value={v.timezone} onChange={(x) => set("timezone", x.target.value)}>
                  {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
                </Select>
              </Field>
              <Field label="Date format">
                <Select value={v.dateFormat} onChange={(x) => set("dateFormat", x.target.value as Values["dateFormat"])}>
                  <option value="dd MMM yyyy">13 Nov 2026</option>
                  <option value="yyyy-MM-dd">2026-11-13</option>
                  <option value="dd/MM/yyyy">13/11/2026</option>
                </Select>
              </Field>
              <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2">
                <input type="checkbox" checked={v.emailNotifications} onChange={(x) => set("emailNotifications", x.target.checked)} className="size-4 rounded border-slate-300 accent-brand-600" />
                Send email copies of notifications (once a backend is connected)
              </label>
              {editable && (
                <div className="flex justify-end sm:col-span-2">
                  <Button type="submit" icon={Save} loading={save.pending}>Save configuration</Button>
                </div>
              )}
            </CardBody>
          </fieldset>
        </Card>
      </form>

      {editable && (
        <Card>
          <CardHeader title="Demo data" />
          <CardBody className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <p>Restore all employees, tasks, attendance and settings to the original sample data.</p>
            <Button variant="danger" icon={RefreshCw} onClick={() => setConfirmReset(true)}>Reset demo data</Button>
          </CardBody>
        </Card>
      )}
      <ConfirmDialog
        open={confirmReset}
        danger
        title="Reset all demo data?"
        message="Every change made in this browser (new employees, tasks, leave, attendance, settings) will be discarded."
        confirmLabel="Reset data"
        loading={reset.pending}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          await reset.run(() => settingsService.resetDemoData(), "Demo data restored");
          setConfirmReset(false);
        }}
      />
    </div>
  );
}
