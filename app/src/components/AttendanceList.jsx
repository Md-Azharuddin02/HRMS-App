import { useMemo, memo } from "react";
import { CheckCircle, XCircle, CalendarDays } from "lucide-react";

/* ================= COMPONENT ================= */

function AttendanceList({ attendance = [], loading = false }) {
  const formattedAttendance = useMemo(() => {
    return attendance.map((record) => ({
      ...record,
      formattedDate: new Date(record.date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }));
  }, [attendance]);

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="mt-8 space-y-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 rounded-xl bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    );
  }

  /* ================= EMPTY STATE ================= */
  if (!attendance.length) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 p-8 bg-white">
        <CalendarDays className="w-10 h-10 text-slate-400 mb-3" />
        <h3 className="text-base font-semibold text-slate-700">
          No Attendance Records
        </h3>
        <p className="text-sm text-slate-500 mt-1 text-center">
          Attendance entries will appear here once marked.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10">
      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">
            Attendance History
          </h2>
          <p className="text-xs text-slate-500">
            Track employee daily attendance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-500 uppercase text-xs tracking-wide sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {formattedAttendance.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50 transition"
                >
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {record.formattedDate}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-4">
        {formattedAttendance.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex justify-between items-center"
          >
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <CalendarDays className="w-4 h-4 text-indigo-500" />
              {record.formattedDate}
            </div>

            <StatusBadge status={record.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= STATUS BADGE ================= */

const StatusBadge = memo(function StatusBadge({ status }) {
  const base =
    "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full";

  if (status === "Present") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        <CheckCircle className="w-3.5 h-3.5" />
        Present
      </span>
    );
  }

  if (status === "Absent") {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        <XCircle className="w-3.5 h-3.5" />
        Absent
      </span>
    );
  }

  return (
    <span className={`${base} bg-slate-100 text-slate-600`}>
      {status}
    </span>
  );
});

export default memo(AttendanceList);
