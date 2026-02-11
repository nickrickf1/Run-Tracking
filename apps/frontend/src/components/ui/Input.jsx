export default function Input({ className = "", ...props }) {
    return (
        <input
            className={[
                "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm",
                "placeholder:text-slate-400",
                "transition-all duration-150",
                "focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent",
                "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder:text-slate-500",
                "dark:focus:bg-slate-700 dark:focus:ring-slate-500",
                className,
            ].join(" ")}
            {...props}
        />
    );
}
