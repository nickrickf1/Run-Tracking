import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";
import { useTheme } from "../../context/ThemeContext";

export default function WeeklyChart({ data }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
            <h3 className="mb-4 text-sm font-bold text-slate-800 dark:text-white">Km per settimana</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="weekStart"
                        tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }}
                        tickFormatter={(v) => v.slice(5, 10)}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
                            backgroundColor: isDark ? "#1e293b" : "#fff",
                            color: isDark ? "#e2e8f0" : "#0f172a",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "13px",
                        }}
                        formatter={(value) => [`${Number(value).toFixed(1)} km`, "Distanza"]}
                        labelFormatter={(label) => `Settimana del ${label.slice(0, 10)}`}
                    />
                    <Bar dataKey="totalDistanceKm" fill={isDark ? "#e2e8f0" : "#0f172a"} radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
