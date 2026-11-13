import type { EmployeeService } from "./contracts";
import { ServiceError, db, employeeMatches, findOr404, logActivity, respond, save } from "./mock/db";
import type { EmployeeInput } from "../types";
import { demoUsers } from "../mock-data";

function assertUniqueEmail(email: string, exceptId?: string) {
  if (db.employees.some((e) => e.email.toLowerCase() === email.toLowerCase() && e.id !== exceptId)) {
    throw new ServiceError("An employee with this email already exists");
  }
}

function nextId() {
  const max = Math.max(0, ...db.employees.map((e) => Number(e.id.replace(/\D/g, "")) || 0));
  return `EMP-${String(max + 1).padStart(3, "0")}`;
}

export const employeeService: EmployeeService = {
  async list(scope) {
    return respond(db.employees.filter((e) => employeeMatches(scope, e.id)));
  },

  async get(id) {
    return respond(findOr404(db.employees, id, "Employee"));
  },

  async create(input: EmployeeInput) {
    assertUniqueEmail(input.email);
    const emp = { ...input, id: nextId() };
    db.employees.push(emp);
    logActivity("system", "employee", `added ${emp.firstName} ${emp.lastName} to the team`);
    save();
    return respond(emp);
  },

  async update(id, patch) {
    const emp = findOr404(db.employees, id, "Employee");
    if (patch.email) assertUniqueEmail(patch.email, id);
    Object.assign(emp, patch);
    save();
    return respond(emp);
  },

  async remove(id) {
    findOr404(db.employees, id, "Employee");
    if (Object.values(demoUsers).includes(id)) throw new ServiceError("This is a demo role account used by the role switcher and can't be deleted");
    if (db.departments.some((d) => d.headId === id)) {
      throw new ServiceError("This employee heads a department. Assign a new head first.");
    }
    db.employees = db.employees.filter((e) => e.id !== id);
    save();
    return respond(undefined);
  },
};
