import { PageHeader } from "../components/ui/Misc";
import { DepartmentGrid } from "../modules/departments/DepartmentGrid";

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader title="Departments" description="Teams, who leads them and how they're doing today." />
      <DepartmentGrid />
    </>
  );
}
