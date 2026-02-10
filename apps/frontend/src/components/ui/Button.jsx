export default function Button({ children, className = "", ...props }) {
    return (
        <button
            className={[
                "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium",
                "bg-slate-900 text-white hover:bg-slate-800",
                "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className,
            ].join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}
