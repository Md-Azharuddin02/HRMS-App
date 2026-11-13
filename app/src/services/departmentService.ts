import type { DepartmentService } from "./contracts";
import { ServiceError, db, findOr404, respond, save } from "./mock/db";

function assertUniqueCode(code: string, exceptId?: string) {
  if (db.departments.some((d) => d.code.toUpperCase() === code.toUpperCase() && d.id !== exceptId)) {
    throw new ServiceError("Department code must be unique");
  }
}

export const departmentService: DepartmentService = {
  async list() {
    return respond(db.departments);
  },

  async get(id) {
    return respond(findOr404(db.departments, id, "Department"));
  },

  async create(input) {
    assertUniqueCode(input.code);
    const dep = { ...input, code: input.code.toUpperCase(), id: `DEP-${input.code.toUpperCase()}` };
    db.departments.push(dep);
    save();
    return respond(dep);
  },

  async update(id, patch) {
    const dep = findOr404(db.departments, id, "Department");
    if (patch.code) assertUniqueCode(patch.code, id);
    Object.assign(dep, patch, patch.code ? { code: patch.code.toUpperCase() } : {});
    save();
    return respond(dep);
  },

  async remove(id) {
    findOr404(db.departments, id, "Department");
    const count = db.employees.filter((e) => e.departmentId === id).length;
    if (count) throw new ServiceError(`Move the ${count} employee(s) in this department before deleting it`);
    db.departments = db.departments.filter((d) => d.id !== id);
    save();
    return respond(undefined);
  },
};
