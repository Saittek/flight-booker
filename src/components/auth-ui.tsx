const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:outline-none";

export { inputClass };

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-6">{children}</div>
    </div>
  );
}
