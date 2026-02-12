import { useState, useCallback, useEffect, memo } from "react";
import API from "../api/api";

function AttendanceForm({ employeeId, refresh }) {
  const [form, setForm] = useState({
    date: "",
    status: "Present",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Auto clear success after 2 seconds
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
    <div className="w-full max-w-lg mx-auto mt-8 px-4 sm:px-0">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-2xl p-6 sm:p-8 space-y-6"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Mark Attendance
        </h2>

        {/* Date Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-slate-600">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            max={new Date().toISOString().split("T")[0]}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            required
          />
        </div>

        {/* Status Field */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-slate-600">
            Status
          </label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Processing...
            </span>
          ) : (
            "Mark Attendance"
          )}
        </button>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 text-sm p-3 rounded-lg">
            Attendance marked successfully.
          </div>
        )}
      </form>
    </div>
  );
}

export default memo(AttendanceForm);
