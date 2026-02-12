import { useState, useCallback, memo } from "react";
import API from "../api/api";
import {
  Trash2,
  Users,
  AlertTriangle,
  Loader2,
} from "lucide-react";

/* ================= MAIN COMPONENT ================= */

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

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-lg bg-slate-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  /* ================= EMPTY ================= */

  if (!employees.length) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 bg-white">
        <Users className="w-8 h-8 text-slate-400 mb-3" />
        <h3 className="text-md font-semibold text-slate-700">
          No Employees Found
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Employees will appear here once added.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">

        {/* Header */}
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            Employee Directory
          </h2>
          <p className="text-xs text-slate-500">
            Manage employee records
          </p>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left hidden md:table-cell">Department</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {emp.employee_id}
                  </td>

                  <td className="px-4 py-3 text-slate-800">
                    {emp.full_name}
                  </td>

                  <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">
                    {emp.email}
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    <DepartmentBadge name={emp.department} />
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setConfirmId(emp.id)}
                      className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL ================= */}

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

/* ================= DELETE MODAL ================= */

const DeleteModal = memo(function DeleteModal({
  onCancel,
  onConfirm,
  loading,
  error,
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">

        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500" />
          <h3 className="font-semibold text-slate-800">
            Delete Employee
          </h3>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          This action cannot be undone.
        </p>

        {error && (
          <p className="text-sm text-red-500 mb-3">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center gap-2"
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

/* ================= BADGE ================= */

const DepartmentBadge = memo(function DepartmentBadge({ name }) {
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-700">
      {name}
    </span>
  );
});

export default memo(EmployeeList);
