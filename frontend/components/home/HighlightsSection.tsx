import { FEATURES } from "@/components/home/content";

export default function HighlightsSection() {
  return (
    <section aria-labelledby="highlights-heading" className="bg-white px-6 py-16 text-slate-900 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Highlights</p>
            <h2 id="highlights-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">
              Professional signal. Human-led outcomes.
            </h2>
            <p className="mt-4 text-base text-slate-600">
              Designed for HR teams who need structure, accountability, and speed without compromising fairness.
            </p>
          </div>
          <ul className="space-y-4">
            {FEATURES.map((item) => (
              <li key={item} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                <span className="text-sm font-semibold text-slate-800">{item}</span>
                <span className="text-xs uppercase tracking-[0.25em] text-teal-600">Active</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
