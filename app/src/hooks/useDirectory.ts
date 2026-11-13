import { useMemo } from "react";
import { departmentService, employeeService } from "../services";
import type { Department, Employee } from "../types";
import { useQuery } from "./useQuery";

/** Employees + departments with id lookups — the reference data almost every screen needs. */
export function useDirectory() {
  const emps = useQuery(() => employeeService.list(), []);
  const deps = useQuery(() => departmentService.list(), []);

  return useMemo(() => {
    const employees = emps.data ?? [];
    const departments = deps.data ?? [];
    const empMap = new Map<string, Employee>(employees.map((e) => [e.id, e]));
    const depMap = new Map<string, Department>(departments.map((d) => [d.id, d]));
    return {
      employees,
      departments,
      employee: (id: string | null | undefined) => (id ? empMap.get(id) : undefined),
      department: (id: string | null | undefined) => (id ? depMap.get(id) : undefined),
      ready: !!emps.data && !!deps.data,
      error: emps.error ?? deps.error,
      reload: () => {
        emps.reload();
        deps.reload();
      },
    };
  }, [emps, deps]);
}

export type Directory = ReturnType<typeof useDirectory>;
