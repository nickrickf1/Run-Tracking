export default function Input({ className = "", ...props }) {
    return (
        <input
            className={[
                "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm",
                "placeholder:text-slate-400",
                "focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-300",
                className,
            ].join(" ")}
            {...props}
        />
    );
}
