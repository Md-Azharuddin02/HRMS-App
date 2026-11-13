import { Lock, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { Button } from "../../components/ui/Button";
import { Card, CardHeader } from "../../components/ui/Card";
import { useMutation } from "../../hooks/useMutation";
import { useSession } from "../../hooks/useSession";
import { settingsService } from "../../services";
import type { Permission, Role, RolePermissions } from "../../types";
import { LOCKED, PERMISSION_LABELS, ROLES, ROLE_LABELS } from "../../utils/permissions";

const PERMS = Object.keys(PERMISSION_LABELS) as Permission[];

/** Role × permission grid. Changes apply to navigation immediately after saving (frontend preview only). */
export function RolesMatrix({ initial }: { initial: RolePermissions }) {
  const { can } = useSession();
  const editable = can("roles.manage");
  const [map, setMap] = useState<RolePermissions>(initial);
  const { run, pending } = useMutation();
  const dirty = JSON.stringify(map) !== JSON.stringify(initial);
  const groups = [...new Set(PERMS.map((p) => PERMISSION_LABELS[p].group))];

  const toggle = (role: Role, p: Permission) =>
    setMap((m) => ({ ...m, [role]: m[role].includes(p) ? m[role].filter((x) => x !== p) : [...m[role], p] }));

  return (
    <Card>
      <CardHeader
        title="Roles & permissions"
        description={editable ? "Choose what each role can see and do. Real enforcement must also be implemented in the backend." : "Only a Super Admin can change permissions."}
        actions={
          editable && (
            <>
              <Button variant="ghost" icon={RotateCcw} disabled={!dirty} onClick={() => setMap(initial)}>Discard</Button>
              <Button icon={Save} disabled={!dirty} loading={pending} onClick={() => run(() => settingsService.updateRolePermissions(map), "Permissions saved")}>Save</Button>
            </>
          )
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Permissions per role</caption>
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-2.5 text-left font-medium">Permission</th>
              {ROLES.map((r) => <th key={r} scope="col" className="px-2 py-2.5 text-center font-medium">{ROLE_LABELS[r]}</th>)}
            </tr>
          </thead>
          {groups.map((g) => (
            <tbody key={g} className="divide-y divide-slate-100 border-b border-slate-200">
              <tr>
                <th colSpan={ROLES.length + 1} scope="colgroup" className="bg-slate-50/60 px-4 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">{g}</th>
              </tr>
              {PERMS.filter((p) => PERMISSION_LABELS[p].group === g).map((p) => (
                <tr key={p}>
                  <th scope="row" className="px-4 py-2 text-left font-normal text-slate-700">{PERMISSION_LABELS[p].label}</th>
                  {ROLES.map((r) => {
                    const locked = LOCKED[r]?.includes(p);
                    return (
                      <td key={r} className="px-2 py-2 text-center">
                        <label className="inline-flex items-center justify-center gap-1">
                          <input
                            type="checkbox"
                            checked={map[r].includes(p)}
                            disabled={!editable || locked}
                            onChange={() => toggle(r, p)}
                            className="size-4 rounded border-slate-300 accent-brand-600 disabled:opacity-60"
                            aria-label={`${ROLE_LABELS[r]}: ${PERMISSION_LABELS[p].label}`}
                          />
                          {locked && <Lock className="size-3 text-slate-400" aria-label="Locked" />}
                        </label>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>
    </Card>
  );
}
