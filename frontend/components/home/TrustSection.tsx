import Link from "next/link";

import { DIFFERENTIATORS } from "@/components/home/content";

export default function TrustSection() {
  return (
    <section aria-labelledby="why-teams-trust-it-heading" className="bg-slate-950 px-6 py-16 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80">Why Teams Trust It</p>
            <h2 id="why-teams-trust-it-heading" className="mt-4 text-3xl font-semibold text-white sm:text-4xl">
              Built for fairness, clarity, and control
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Ethical AI should elevate human review, not replace it. HireNowPro keeps the process transparent and
              accountable.
            </p>
          </div>
          <Link
            href="/positions"
            className="rounded-full border border-teal-300/60 px-6 py-3 text-sm font-semibold text-teal-100 transition hover:border-teal-200 hover:text-white"
          >
            Start Initial Interview
          </Link>
        </div>

        <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {DIFFERENTIATORS.map((item) => (
            <li
              key={item.title}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:border-teal-400/60 hover:bg-white/10"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-3 text-sm text-slate-300">{item.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
