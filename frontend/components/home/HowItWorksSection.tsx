import { STEPS } from "@/components/home/content";

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="bg-white px-6 py-16 text-slate-900 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">How It Works</p>
          <h2 id="how-it-works-heading" className="mt-4 text-3xl font-semibold sm:text-4xl">
            A clear, ethical review loop
          </h2>
          <p className="mt-4 text-base text-slate-600">
            Semi-automation means speed without sacrificing judgment. The process is efficient, structured, and
            HR-led at every decision point.
          </p>
        </div>

        <ol className="mt-10 grid gap-6 md:grid-cols-2">
          {STEPS.map((step, index) => (
            <li
              key={step.label}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 transition hover:border-teal-300/60 hover:bg-white"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-600">Step {index + 1}</p>
              <h3 className="mt-3 text-xl font-semibold">{step.label}</h3>
              <p className="mt-2 text-sm text-slate-600">{step.detail}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
