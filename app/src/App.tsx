import { lazy, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { RequirePermission } from "./components/RequirePermission";
import { ToastProvider } from "./components/ui/Toast";
import { ListSkeleton } from "./components/ui/States";
import { SessionProvider } from "./hooks/useSession";
import { AppLayout } from "./layouts/AppLayout";
import type { Permission } from "./types";

const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EmployeesPage = lazy(() => import("./pages/EmployeesPage"));
const EmployeeDetailPage = lazy(() => import("./pages/EmployeeDetailPage"));
const DepartmentsPage = lazy(() => import("./pages/DepartmentsPage"));
const DepartmentDetailPage = lazy(() => import("./pages/DepartmentDetailPage"));
const AttendancePage = lazy(() => import("./pages/AttendancePage"));
const WorkLogsPage = lazy(() => import("./pages/WorkLogsPage"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const TaskDetailPage = lazy(() => import("./pages/TaskDetailPage"));
const LeavePage = lazy(() => import("./pages/LeavePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const ReportsPage = lazy(() => import("./pages/ReportsPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const guard = (permission: Permission, page: ReactNode) => <RequirePermission permission={permission}>{page}</RequirePermission>;

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SessionProvider fallback={<ListSkeleton rows={6} label="Starting app" />}>
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="employees" element={guard("employees.view", <EmployeesPage />)} />
                <Route path="employees/:id" element={<EmployeeDetailPage />} />
                <Route path="departments" element={<DepartmentsPage />} />
                <Route path="departments/:id" element={<DepartmentDetailPage />} />
                <Route path="attendance" element={<AttendancePage />} />
                <Route path="work-logs" element={<WorkLogsPage />} />
                <Route path="tasks" element={<TasksPage />} />
                <Route path="tasks/:id" element={<TaskDetailPage />} />
                <Route path="leave" element={<LeavePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="reports" element={guard("reports.view", <ReportsPage />)} />
                <Route path="admin" element={guard("admin.access", <AdminPage />)} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </SessionProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
