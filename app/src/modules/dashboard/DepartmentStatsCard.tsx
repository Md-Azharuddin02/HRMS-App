import { Link } from "react-router-dom";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Progress } from "../../components/ui/Misc";
import { QueryView } from "../../components/ui/States";
import { useQuery } from "../../hooks/useQuery";
import { reportService } from "../../services";
import { pct } from "../../utils/format";

export function DepartmentStatsCard({ onlyId }: { onlyId?: string }) {
  const q = useQuery(() => reportService.departmentStats(), []);
  return (
    <Card>
      <CardHeader title="Departments" description="Today's attendance and open work by department" />
      <QueryView query={q}>
        {(all) => {
          const stats = onlyId ? all.filter((s) => s.departmentId === onlyId) : all;
          return (
            <CardBody className="space-y-5">
              {!onlyId && (
                <div className="h-44" role="img" aria-label="Bar chart of open and completed tasks per department">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats} margin={{ left: -20, right: 4, top: 4, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} interval={0} tickFormatter={(n: string) => n.split(" ")[0]} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: "#f1f5f9" }} contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                      <Bar dataKey="openTasks" name="Open tasks" fill="#0f766e" radius={[3, 3, 0, 0]} maxBarSize={22} />
                      <Bar dataKey="completedTasks" name="Completed" fill="#99d5cb" radius={[3, 3, 0, 0]} maxBarSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
              <ul className="space-y-3">
                {stats.map((s) => (
                  <li key={s.departmentId}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <Link to={`/departments/${s.departmentId}`} className="flex items-center gap-2 font-medium text-slate-800 hover:underline">
                        <span className="size-2 rounded-full" style={{ backgroundColor: s.color }} aria-hidden />
                        {s.name}
                      </Link>
                      <span className="text-xs tabular-nums text-slate-500">
                        {s.present}/{s.employees} present · {s.openTasks} open
                      </span>
                    </div>
                    <Progress value={pct(s.present, s.employees)} label={`${s.name} attendance today`} />
                  </li>
                ))}
              </ul>
            </CardBody>
          );
        }}
      </QueryView>
    </Card>
  );
}
