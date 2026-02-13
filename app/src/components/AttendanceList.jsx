import { useMemo, memo } from "react";
import { CheckCircle, XCircle, CalendarDays } from "lucide-react";

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

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-16 sm:h-20 rounded-xl sm:rounded-2xl bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse"
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    );
  }

  if (!attendance.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 p-8 sm:p-12 bg-white shadow-sm">
        <div className="p-4 bg-slate-100 rounded-full mb-4">
          <CalendarDays className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-700">
          No Attendance Records
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 text-center">
          Attendance entries will appear here once marked.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-5 border-b bg-gradient-to-r from-slate-50 to-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Attendance History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track employee daily attendance
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Date</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {formattedAttendance.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 font-semibold text-slate-800">
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

      <div className="md:hidden space-y-3">
        {formattedAttendance.map((record) => (
          <div
            key={record.id}
            className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl p-4 shadow-lg flex justify-between items-center hover:shadow-xl transition-shadow duration-200"
          >
            <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
              <div className="p-1.5 bg-indigo-100 rounded-lg">
                <CalendarDays className="w-4 h-4 text-indigo-600" />
              </div>
              {record.formattedDate}
            </div>

            <StatusBadge status={record.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

const StatusBadge = memo(function StatusBadge({ status }) {
  const base =
    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full shadow-sm";

  if (status === "Present") {
    return (
      <span className={`${base} bg-gradient-to-r from-green-100 to-green-200 text-green-700 border border-green-300`}>
        <CheckCircle className="w-3.5 h-3.5" />
        Present
      </span>
    );
  }

  if (status === "Absent") {
    return (
      <span className={`${base} bg-gradient-to-r from-red-100 to-red-200 text-red-700 border border-red-300`}>
        <XCircle className="w-3.5 h-3.5" />
        Absent
      </span>
    );
  }

  return (
    <span className={`${base} bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 border border-slate-300`}>
      {status}
    </span>
  );
});

export default memo(AttendanceList);