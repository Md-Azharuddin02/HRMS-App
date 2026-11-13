import { Field, Input, Select, Textarea } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { required, useForm, type Errors } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { departmentService } from "../../services";
import type { Department, DepartmentInput, Employee } from "../../types";
import { fullName } from "../../utils/format";

const COLORS = ["#2563eb", "#0d9488", "#d97706", "#db2777", "#7c3aed", "#475569", "#16a34a", "#dc2626"];

function validate(v: DepartmentInput): Errors<DepartmentInput> {
  return {
    name: required(v.name, "Name"),
    code: required(v.code, "Code") ?? (/^[A-Za-z]{2,6}$/.test(v.code) ? undefined : "Use 2–6 letters"),
  };
}

export function DepartmentFormModal({ open, onClose, department, employees }: { open: boolean; onClose: () => void; department?: Department; employees: Employee[] }) {
  const { id: _id, ...existing } = department ?? ({} as Department);
  const form = useForm<DepartmentInput>(department ? existing : { name: "", code: "", description: "", headId: null, color: COLORS[0] }, validate);
  const { run, pending } = useMutation();
  const { values: v, errors: e, set } = form;
  const members = department ? employees.filter((x) => x.departmentId === department.id) : [];

  const submit = form.handleSubmit(async (values) => {
    const ok = department
      ? await run(() => departmentService.update(department.id, values), "Department updated")
      : await run(() => departmentService.create(values), "Department created");
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={department ? `Edit ${department.name}` : "New department"}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="department-form" loading={pending}>{department ? "Save changes" : "Create department"}</Button>
        </>
      }
    >
      <form id="department-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Name" required error={e.name} className="sm:col-span-2"><Input value={v.name} onChange={(x) => set("name", x.target.value)} /></Field>
        <Field label="Code" required error={e.code}><Input value={v.code} onChange={(x) => set("code", x.target.value.toUpperCase())} maxLength={6} /></Field>
        <Field label="Description" className="sm:col-span-3"><Textarea value={v.description} onChange={(x) => set("description", x.target.value)} /></Field>
        <Field label="Department head" className="sm:col-span-2" hint={department ? undefined : "Add employees first, then pick a head."}>
          <Select value={v.headId ?? ""} onChange={(x) => set("headId", x.target.value || null)} disabled={!members.length}>
            <option value="">No head assigned</option>
            {members.map((m) => <option key={m.id} value={m.id}>{fullName(m)}</option>)}
          </Select>
        </Field>
        <fieldset>
          <legend className="mb-1 text-xs font-medium text-slate-700">Colour</legend>
          <div className="flex flex-wrap gap-1.5">
            {COLORS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="color" value={c} checked={v.color === c} onChange={() => set("color", c)} className="peer sr-only" />
                <span className="block size-6 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-900 peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500" style={{ backgroundColor: c }} />
                <span className="sr-only">{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </form>
    </Modal>
  );
}
