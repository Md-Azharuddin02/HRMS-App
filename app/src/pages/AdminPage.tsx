import { useSearchParams } from "react-router-dom";
import { PageHeader, Tabs } from "../components/ui/Misc";
import { QueryView } from "../components/ui/States";
import { useQuery } from "../hooks/useQuery";
import { RolesMatrix } from "../modules/admin/RolesMatrix";
import { SettingsForm } from "../modules/admin/SettingsForm";
import { SystemConfig } from "../modules/admin/SystemConfig";
import { DepartmentGrid } from "../modules/departments/DepartmentGrid";
import { EmployeeTable } from "../modules/employees/EmployeeTable";
import { settingsService } from "../services";

const TABS = [
  { id: "employees", label: "Employees" },
  { id: "departments", label: "Departments" },
  { id: "roles", label: "Roles & permissions" },
  { id: "settings", label: "Application settings" },
  { id: "system", label: "System" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function AdminPage() {
  const [params, setParams] = useSearchParams();
  const tab = (TABS.find((t) => t.id === params.get("tab"))?.id ?? "employees") as Tab;
  const perms = useQuery(() => settingsService.rolePermissions(), []);
  const settings = useQuery(() => settingsService.get(), []);

  return (
    <>
      <PageHeader title="Admin Panel" description="Manage people, structure, access and configuration." />
      <div className="mb-5">
        <Tabs<Tab> label="Admin sections" value={tab} onChange={(t) => setParams({ tab: t }, { replace: true })} tabs={[...TABS]} />
      </div>
      {tab === "employees" && <EmployeeTable />}
      {tab === "departments" && <DepartmentGrid />}
      {/* Keyed on data so forms re-initialise after saves or a demo reset. */}
      {tab === "roles" && <QueryView query={perms}>{(p) => <RolesMatrix key={JSON.stringify(p)} initial={p} />}</QueryView>}
      {tab === "settings" && <QueryView query={settings}>{(s) => <SettingsForm key={JSON.stringify(s)} initial={s} />}</QueryView>}
      {tab === "system" && <QueryView query={settings}>{(s) => <SystemConfig key={JSON.stringify(s)} initial={s} />}</QueryView>}
    </>
  );
}
