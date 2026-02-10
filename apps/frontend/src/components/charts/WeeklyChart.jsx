import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

export default function WeeklyChart({ data }) {
    return (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-4 text-sm font-bold text-slate-800">Km per settimana</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="weekStart"
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        tickFormatter={(v) => v.slice(5, 10)}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                            fontSize: "13px",
                        }}
                        formatter={(value) => [`${Number(value).toFixed(1)} km`, "Distanza"]}
                        labelFormatter={(label) => `Settimana del ${label.slice(0, 10)}`}
                    />
                    <Bar dataKey="totalDistanceKm" fill="#0f172a" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
