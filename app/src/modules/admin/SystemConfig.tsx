import { Server, Save } from "lucide-react";
import { Field, Select } from "../../components/form/Field";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { useForm } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { settingsService } from "../../services";
import type { AppSettings } from "../../types";

type Values = Pick<AppSettings, "timezone" | "dateFormat" | "emailNotifications">;
const TIMEZONES = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York", "UTC"];
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

/** Environment settings that affect how the API computes "today", lateness and notifications. */
export function SystemConfig({ initial }: { initial: AppSettings }) {
  const { can } = useSession();
  const editable = can("settings.manage");
  const form = useForm<Values>({ timezone: initial.timezone, dateFormat: initial.dateFormat, emailNotifications: initial.emailNotifications }, () => ({}));
  const save = useMutation();
  const { values: v, set } = form;

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader title="Data source" actions={<Badge tone="green"><Server className="size-3" aria-hidden />Connected</Badge>} />
        <CardBody className="space-y-2 text-sm text-slate-600">
          <p>
            All data is stored by the HRMS API at <code className="break-all rounded bg-slate-100 px-1 text-xs">{API_URL}</code>. The URL is set at build time with{" "}
            <code className="rounded bg-slate-100 px-1 text-xs">VITE_API_URL</code>.
          </p>
        </CardBody>
      </Card>

      <form onSubmit={form.handleSubmit((x) => save.run(() => settingsService.update(x), "Configuration saved"))} noValidate>
        <Card>
          <CardHeader title="System configuration" />
          <fieldset disabled={!editable}>
            <CardBody className="grid gap-4 sm:grid-cols-2">
              <Field label="Company timezone" hint="Decides when a new working day starts and who counts as late.">
                <Select value={v.timezone} onChange={(x) => set("timezone", x.target.value)}>
                  {[...new Set([v.timezone, ...TIMEZONES])].map((t) => <option key={t}>{t}</option>)}
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
                Email copies of notifications (saved for when an email provider is configured)
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
    </div>
  );
}
