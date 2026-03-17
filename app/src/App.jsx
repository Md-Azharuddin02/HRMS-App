import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import Layout from "./layout/Layout";
import Loader from "./components/ui/Loader";
import EmployeesSkeleton from "./components/ui/EmployeesSkeleton";
import DashboardSkeleton from "./components/ui/DashboardSkeleton";

const Employees = lazy(() => import("./pages/Employees"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Dashboard = lazy(() => import("./pages/Dashboard"));

function App() {
  return (
    <BrowserRouter>

      <Routes>
        <Route
          element={
            <Suspense fallback={<Loader />}>
              <Layout />
            </Suspense>
          }
        >
           <Route
            path="/dashboard"
            element={
              <Suspense fallback={<DashboardSkeleton />}>
                <Dashboard />
              </Suspense>
            }
          />

          <Route
            path="/employees"
            element={
              <Suspense fallback={<EmployeesSkeleton />}>
                <Employees />
              </Suspense>
            }
          />

         

          <Route
            path="/attendance"
            element={
              <Suspense fallback={<Loader />}>
                <Attendance />
              </Suspense>
            }
          />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Route>
      </Routes>

    </BrowserRouter>
  );
}

export default App;