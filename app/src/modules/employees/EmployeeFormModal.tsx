import { Field, Input, Select } from "../../components/form/Field";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { EMAIL, PHONE, required, useForm, type Errors } from "../../hooks/useForm";
import { useMutation } from "../../hooks/useMutation";
import { employeeService } from "../../services";
import type { Department, Employee, EmployeeInput } from "../../types";
import { today } from "../../utils/date";
import { EMPLOYMENT_LABEL, EMPLOYMENT_STATUSES } from "../../utils/labels";
import { ROLES, ROLE_LABELS } from "../../utils/permissions";

const blank = (departmentId: string): EmployeeInput => ({
  firstName: "", lastName: "", email: "", phone: "", departmentId, designation: "",
  joiningDate: today(), status: "probation", role: "employee", location: "Bengaluru",
});

function validate(v: EmployeeInput): Errors<EmployeeInput> {
  return {
    firstName: required(v.firstName, "First name"),
    lastName: required(v.lastName, "Last name"),
    email: required(v.email, "Email") ?? (EMAIL.test(v.email) ? undefined : "Enter a valid email"),
    phone: required(v.phone, "Phone") ?? (PHONE.test(v.phone) ? undefined : "Enter a valid phone number"),
    designation: required(v.designation, "Designation"),
    joiningDate: required(v.joiningDate, "Joining date"),
    departmentId: required(v.departmentId, "Department"),
  };
}

interface Props {
  open: boolean;
  onClose: () => void;
  employee?: Employee;
  departments: Department[];
}

/** Create or edit an employee. Remounted per open (via key) so the form starts fresh. */
export function EmployeeFormModal({ open, onClose, employee, departments }: Props) {
  const { id: _id, ...existing } = employee ?? ({} as Employee);
  const form = useForm<EmployeeInput>(employee ? existing : blank(departments[0]?.id ?? ""), validate);
  const { run, pending } = useMutation();
  const { values: v, errors: e, set } = form;

  const submit = form.handleSubmit(async (values) => {
    const ok = employee
      ? await run(() => employeeService.update(employee.id, values), "Employee updated")
      : await run(() => employeeService.create(values), "Employee added");
    if (ok) onClose();
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={employee ? `Edit ${employee.firstName} ${employee.lastName}` : "Add employee"}
      description={employee ? `Employee ID ${employee.id}` : "The employee ID is generated automatically."}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" form="employee-form" loading={pending}>{employee ? "Save changes" : "Add employee"}</Button>
        </>
      }
    >
      <form id="employee-form" onSubmit={submit} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" required error={e.firstName}><Input value={v.firstName} onChange={(x) => set("firstName", x.target.value)} autoComplete="off" /></Field>
        <Field label="Last name" required error={e.lastName}><Input value={v.lastName} onChange={(x) => set("lastName", x.target.value)} autoComplete="off" /></Field>
        <Field label="Work email" required error={e.email}><Input type="email" value={v.email} onChange={(x) => set("email", x.target.value)} autoComplete="off" /></Field>
        <Field label="Phone" required error={e.phone}><Input type="tel" value={v.phone} onChange={(x) => set("phone", x.target.value)} placeholder="+91 98450 00000" /></Field>
        <Field label="Department" required error={e.departmentId}>
          <Select value={v.departmentId} onChange={(x) => set("departmentId", x.target.value)}>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </Field>
        <Field label="Designation" required error={e.designation}><Input value={v.designation} onChange={(x) => set("designation", x.target.value)} placeholder="e.g. QA Engineer" /></Field>
        <Field label="Joining date" required error={e.joiningDate}><Input type="date" value={v.joiningDate} onChange={(x) => set("joiningDate", x.target.value)} /></Field>
        <Field label="Location"><Input value={v.location} onChange={(x) => set("location", x.target.value)} /></Field>
        <Field label="Employment status">
          <Select value={v.status} onChange={(x) => set("status", x.target.value as EmployeeInput["status"])}>
            {EMPLOYMENT_STATUSES.map((s) => <option key={s} value={s}>{EMPLOYMENT_LABEL[s]}</option>)}
          </Select>
        </Field>
        <Field label="Role" hint="Controls which screens they see once real auth is connected.">
          <Select value={v.role} onChange={(x) => set("role", x.target.value as EmployeeInput["role"])}>
            {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </Select>
        </Field>
      </form>
    </Modal>
  );
}
