import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip } from "recharts";

export default function WeeklyChart({ data }) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow">
            <h3 className="mb-3 text-sm font-medium">Km per settimana</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data}>
                    <XAxis
                        dataKey="weekStart"
                        tick={{ fontSize: 12 }}
                        tickFormatter={(v) => v.slice(5)} // MM-DD
                    />
                    <Tooltip />
                    <Bar dataKey="totalDistanceKm" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
