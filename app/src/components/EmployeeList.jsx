import { useState, useCallback, memo } from "react";
import API from "../api/api";
import {
  Trash2,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

function EmployeeList({ employees = [], refresh, loading = false }) {
  const [deletingId, setDeletingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState("");

  const handleDelete = useCallback(async () => {
    if (!confirmId) return;

    setDeletingId(confirmId);
    setError("");

    try {
      await API.delete(`/employees/${confirmId}`);
      refresh();
    } catch {
      setError("Failed to delete employee.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  }, [confirmId, refresh]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (!employees.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 p-8 sm:p-12 bg-white shadow-sm">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-700">
          No Employees Found
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 text-center">
          Employees will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-slate-200 shadow-xl rounded-xl sm:rounded-2xl overflow-hidden">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            Employee Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage employee records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm">
            <thead className="text-xs uppercase text-slate-500 bg-slate-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Code</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold hidden sm:table-cell">Email</th>
                <th className="px-3 sm:px-4 py-3 text-left font-semibold hidden md:table-cell">Department</th>
                <th className="px-3 sm:px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="px-3 sm:px-4 py-3 sm:py-4 font-semibold text-slate-700">
                    {emp.employee_id}
                  </td>

                  <td className="px-3 sm:px-4 py-3 sm:py-4 font-medium text-slate-800">
                    {emp.full_name}
                  </td>

                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-slate-600 hidden sm:table-cell">
                    {emp.email}
                  </td>

                  <td className="px-3 sm:px-4 py-3 sm:py-4 hidden md:table-cell">
                    <DepartmentBadge name={emp.department} />
                  </td>

                  <td className="px-3 sm:px-4 py-3 sm:py-4 text-right">
                    <button
                      onClick={() => setConfirmId(emp.id)}
                      className="inline-flex items-center gap-1 sm:gap-1.5 text-red-600 hover:text-red-700 text-xs sm:text-sm font-semibold transition-colors duration-150 px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirmId && (
        <DeleteModal
          onCancel={() => setConfirmId(null)}
          onConfirm={handleDelete}
          loading={deletingId}
          error={error}
        />
      )}
    </>
  );
}

const DeleteModal = memo(function DeleteModal({
  onCancel,
  onConfirm,
  loading,
  error,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-5 sm:p-6 w-full max-w-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="text-red-600 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-slate-800">
            Delete Employee
          </h3>
        </div>

        <p className="text-sm sm:text-base text-slate-600 mb-5">
          This action cannot be undone.
        </p>

        {error && (
          <p className="text-xs sm:text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>
        )}

        <div className="flex justify-end gap-2 sm:gap-3">
          <button
            onClick={onCancel}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors duration-150"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium text-sm transition-all duration-150 shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

const DepartmentBadge = memo(function DepartmentBadge({ name }) {
  return (
    <span className="px-2 sm:px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700">
      {name}
    </span>
  );
});

export default memo(EmployeeList);