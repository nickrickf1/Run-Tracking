export default function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md dark:bg-slate-900 dark:ring-slate-800">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
    );
}
