import { PageHeader } from "../components/ui/Misc";
import { useDirectory } from "../hooks/useDirectory";
import { useSession } from "../hooks/useSession";
import { EmployeeDashboard } from "../modules/dashboard/EmployeeDashboard";
import { OrgDashboard } from "../modules/dashboard/OrgDashboard";
import { formatDate, today } from "../utils/date";
import { ROLE_LABELS } from "../utils/permissions";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

export default function DashboardPage() {
  const { user, role, can, scope } = useSession();
  const dir = useDirectory();
  const scopeLabel = scope.departmentId ? `${dir.department(scope.departmentId)?.name ?? ""} department` : "the whole organisation";

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.firstName}`}
        description={can("dashboard.org") ? `${ROLE_LABELS[role]} view of ${scopeLabel} · ${formatDate(today())}` : formatDate(today())}
      />
      {can("dashboard.org") ? <OrgDashboard /> : <EmployeeDashboard />}
    </>
  );
}
