export default function Skeleton({ className = "", count = 1 }) {
    return (
        <div className="space-y-3">
            {[...Array(count)].map((_, i) => (
                <div
                    key={i}
                    className={[
                        "animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800",
                        className,
                    ].join(" ")}
                />
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <div className="h-4 w-24 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-8 w-16 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
    );
}

export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr>
            {[...Array(cols)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                </td>
            ))}
        </tr>
    );
}
