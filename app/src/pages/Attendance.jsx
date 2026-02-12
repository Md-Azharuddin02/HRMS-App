import { useEffect, useState, useCallback, useMemo } from "react";
import API from "../api/api";
import AttendanceForm from "../components/AttendanceForm";
import AttendanceList from "../components/AttendanceList";
import {
  Users,
  AlertCircle,
  Loader2,
  CalendarCheck,
} from "lucide-react";

function Attendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [attendance, setAttendance] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [error, setError] = useState("");

  /* ================= FETCH EMPLOYEES ================= */

  const fetchEmployees = useCallback(async () => {
    setLoadingEmployees(true);
    setError("");

    try {
      const res = await API.get("/employees/");
      setEmployees(res.data);
    } catch {
      setError("Failed to load employees.");
    } finally {
      setLoadingEmployees(false);
    }
  }, []);

  /* ================= FETCH ATTENDANCE ================= */

  const fetchAttendance = useCallback(async (id) => {
    if (!id) return;

    setLoadingAttendance(true);

    try {
      const res = await API.get(`/attendance/${id}`);
      setAttendance(res.data);
    } catch {
      setAttendance([]);
    } finally {
      setLoadingAttendance(false);
    }
  }, []);

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee);
    }
  }, [selectedEmployee, fetchAttendance]);

  /* ================= MEMOIZED SELECTED EMPLOYEE ================= */

  const selectedEmployeeData = useMemo(() => {
    return employees.find((emp) => emp.id === selectedEmployee);
  }, [employees, selectedEmployee]);

  /* ================= UI ================= */

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Header */}
      <div className="flex items-center gap-3">
        <CalendarCheck className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Attendance Management
          </h1>
          <p className="text-sm text-slate-500">
            Track and manage employee attendance records
          </p>
        </div>
      </div>

      {/* Employee Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <label className="text-sm font-medium text-slate-600 mb-2 block">
          Select Employee
        </label>

        {loadingEmployees ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="animate-spin w-4 h-4" />
            Loading employees...
          </div>
        ) : (
          <select
            value={selectedEmployee || ""}
            onChange={(e) =>
              setSelectedEmployee(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full border border-slate-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="">Choose an employee</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.full_name} ({emp.employee_id})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Selected Employee Info */}
      {selectedEmployeeData && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-semibold text-slate-800">
              {selectedEmployeeData.full_name}
            </h3>
            <p className="text-sm text-slate-500">
              {selectedEmployeeData.department} • {selectedEmployeeData.email}
            </p>
          </div>

          <Users className="text-indigo-400" />
        </div>
      )}

      {/* Attendance Section */}
      {selectedEmployee && (
        <div className="space-y-8">
          <AttendanceForm
            employeeId={selectedEmployee}
            refresh={() => fetchAttendance(selectedEmployee)}
          />

          <AttendanceList
            attendance={attendance}
            loading={loadingAttendance}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 text-red-600 p-4 rounded-lg text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}

export default Attendance;
