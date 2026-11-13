import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AttendanceTrendPoint } from "../../types";
import { formatShortDate } from "../../utils/date";

export const TREND_SERIES = [
  { key: "present", label: "On time", color: "#10b981" },
  { key: "late", label: "Late", color: "#f59e0b" },
  { key: "onLeave", label: "On leave", color: "#8b5cf6" },
  { key: "absent", label: "Absent", color: "#f87171" },
] as const;

export function AttendanceTrendChart({ data, height = 260 }: { data: AttendanceTrendPoint[]; height?: number }) {
  return (
    <div style={{ height }} role="img" aria-label="Stacked bar chart of daily attendance: on time, late, on leave and absent">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} minTickGap={12} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
          <Tooltip labelFormatter={(d) => formatShortDate(String(d))} cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12, borderRadius: 6, borderColor: "#e2e8f0" }} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
          {TREND_SERIES.map((s) => (
            <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} maxBarSize={28} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
