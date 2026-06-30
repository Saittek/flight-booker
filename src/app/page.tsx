import { SearchWizard } from "@/components/SearchWizard";

export default function Home() {
  return (
    <main className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/40 via-slate-950 to-slate-950" />
      <div className="pointer-events-none absolute -right-32 top-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-20 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-12 sm:pt-16">
        <header className="mb-10 text-center sm:mb-14">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-sm text-sky-300">
            <span>✈</span>
            <span>Baggage-aware flight search</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            BagMatch
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-slate-400">
            Tell us exactly what you&apos;re bringing and how you want to sit. We&apos;ll find
            flights where your bags are actually allowed — no checkout surprises.
          </p>
        </header>

        <SearchWizard />

        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Full luggage specs",
              desc: "Carry-on size, weight, checked bags — every piece counted.",
            },
            {
              title: "Every cabin class",
              desc: "Basic economy through first class, with real allowance differences.",
            },
            {
              title: "Total cost upfront",
              desc: "Ticket + bag fees + seat selection, ranked by compatibility.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-5"
            >
              <h3 className="font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
