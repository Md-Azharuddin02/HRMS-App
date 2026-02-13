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

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchAttendance(selectedEmployee);
    }
  }, [selectedEmployee, fetchAttendance]);

  const selectedEmployeeData = useMemo(() => {
    return employees.find((emp) => emp.id === selectedEmployee);
  }, [employees, selectedEmployee]);

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8 space-y-6 sm:space-y-8">
      <div className="flex items-start sm:items-center gap-3 sm:gap-4">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
          <CalendarCheck className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 truncate">
            Attendance Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track and manage employee attendance records
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg">
        <label className="text-xs sm:text-sm font-semibold text-slate-700 mb-2 sm:mb-3 block">
          Select Employee
        </label>

        {loadingEmployees ? (
          <div className="flex items-center gap-2 text-slate-500 py-2">
            <Loader2 className="animate-spin w-4 h-4" />
            <span className="text-sm">Loading employees...</span>
          </div>
        ) : (
          <select
            value={selectedEmployee || ""}
            onChange={(e) =>
              setSelectedEmployee(
                e.target.value ? Number(e.target.value) : null
              )
            }
            className="w-full border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white hover:border-slate-400"
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

      {selectedEmployeeData && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 shadow-sm">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base sm:text-lg text-slate-800 truncate">
              {selectedEmployeeData.full_name}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 truncate">
              {selectedEmployeeData.department} • {selectedEmployeeData.email}
            </p>
          </div>

          <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm">
            <Users className="text-indigo-500 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      )}

      {selectedEmployee && (
        <div className="space-y-6 sm:space-y-8">
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

      {error && (
        <div className="flex items-start sm:items-center gap-2 sm:gap-3 bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm shadow-sm">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}
    </div>
  );
}

export default Attendance;