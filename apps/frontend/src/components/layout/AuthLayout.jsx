export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-4">
                <div className="grid w-full gap-6 md:grid-cols-2">
                    {/* LEFT: brand panel */}
                    <div className="hidden rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-10 text-white shadow-2xl md:flex md:flex-col md:justify-between dark:from-slate-800 dark:to-slate-700">
                        <div>
                            <div className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-slate-300">
                                Run Tracker
                            </div>
                            <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-4 text-base leading-relaxed text-slate-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="text-xs text-slate-500">
                            Express + React + JWT + Prisma + Postgres
                        </div>
                    </div>

                    {/* RIGHT: form card */}
                    <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100 md:p-10 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                        {/* mobile header */}
                        <div className="mb-6 md:hidden">
                            <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                Run Tracker
                            </div>
                            <h1 className="mt-3 text-2xl font-bold tracking-tight dark:text-white">{title}</h1>
                            {subtitle && <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
                        </div>

                        <div className="md:mt-0">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
