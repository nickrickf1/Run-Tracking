export default function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl bg-white p-4 shadow">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
        </div>
    );
}
