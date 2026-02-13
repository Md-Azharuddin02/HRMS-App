import { useState, useCallback, useEffect, memo } from "react";
import API from "../api/api";
import { Calendar, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function AttendanceForm({ employeeId, refresh }) {
  const [form, setForm] = useState({
    date: "",
    status: "Present",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (!form.date) {
        setError("Please select a date.");
        return;
      }

      setError("");
      setSuccess(false);
      setLoading(true);

      try {
        await API.post("/attendance/", {
          employee_id: Number(employeeId),
          date: form.date,
          status: form.status,
        });

        setForm({ date: "", status: "Present" });
        setSuccess(true);
        refresh();
      } catch (err) {
        if (err.response?.status === 409) {
          setError("Attendance already marked for this date.");
        } else if (err.response?.status === 404) {
          setError("Employee not found.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [form, employeeId, refresh]
  );

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-200 shadow-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 space-y-5 sm:space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800">
              Mark Attendance
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Record daily attendance status
            </p>
          </div>
        </div>

        <div className="flex flex-col space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-slate-700">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400"
            required
          />
        </div>

        <div className="flex flex-col space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-slate-700">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border border-slate-300 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-slate-400 bg-white"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              <span className="text-sm sm:text-base">Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Mark Attendance</span>
            </>
          )}
        </button>

        {error && (
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 bg-green-50 border border-green-200 text-green-700 p-3 sm:p-4 rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 sm:mt-0" />
            <span className="flex-1">Attendance marked successfully.</span>
          </div>
        )}
      </form>
    </div>
  );
}

export default memo(AttendanceForm);