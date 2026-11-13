import { PageHeader } from "../components/ui/Misc";
import { useSession } from "../hooks/useSession";
import { EmployeeTable } from "../modules/employees/EmployeeTable";

export default function EmployeesPage() {
  const { scope } = useSession();
  return (
    <>
      <PageHeader title="Employees" description={scope.departmentId ? "People in your department." : "Everyone in the organisation, their roles and employment status."} />
      <EmployeeTable />
    </>
  );
}
