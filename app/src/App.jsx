import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense, useContext } from "react";
import Layout from "./layout/Layout";
import Loader from "./components/Loader";
import { AppContext } from "./store/AppContext";

const Employees = lazy(() => import("./pages/Employees"));
const Attendance = lazy(() => import("./pages/Attendance"));

function App() {
  const { loading } = useContext(AppContext);
  
  return (
    <BrowserRouter>
      {loading && <Loader />}
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="*" element={<Navigate to="/employees" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;