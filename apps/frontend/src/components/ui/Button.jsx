export default function Button({ children, className = "", ...props }) {
    return (
        <button
            className={[
                "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold",
                "bg-slate-900 text-white shadow-sm",
                "transition-all duration-150",
                "hover:bg-slate-800 hover:shadow-md",
                "active:scale-[0.98]",
                "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm",
                className,
            ].join(" ")}
            {...props}
        >
            {children}
        </button>
    );
}
