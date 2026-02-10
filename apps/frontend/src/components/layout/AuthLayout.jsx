export default function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen">
            <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center p-4">
                <div className="grid w-full gap-6 md:grid-cols-2">
                    {/* LEFT: brand panel */}
                    <div className="hidden rounded-3xl bg-slate-900 p-8 text-white shadow-lg md:flex md:flex-col md:justify-between">
                        <div>
                            <div className="text-sm text-slate-300">Run Tracker</div>
                            <h1 className="mt-2 text-3xl font-semibold leading-tight">
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-3 text-sm text-slate-300">
                                    {subtitle}
                                </p>
                            )}
                        </div>

                        <div className="text-xs text-slate-400">
                            Backend + Frontend • JWT • Prisma • Postgres
                        </div>
                    </div>

                    {/* RIGHT: form card */}
                    <div className="rounded-3xl bg-white p-6 shadow-lg md:p-8">
                        {/* mobile header */}
                        <div className="md:hidden">
                            <div className="text-xs font-medium text-slate-500">Run Tracker</div>
                            <h1 className="mt-1 text-2xl font-semibold">{title}</h1>
                            {subtitle && <p className="mt-2 text-sm text-slate-600">{subtitle}</p>}
                        </div>

                        <div className="mt-6 md:mt-0">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
