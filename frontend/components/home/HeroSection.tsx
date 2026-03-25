import Link from "next/link";

import { FEATURES } from "@/components/home/content";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div aria-hidden="true">
        <div className="absolute -top-36 right-[-10%] h-96 w-96 rounded-full bg-teal-500/20 blur-3xl home-animate-orbit" />
        <div className="absolute top-20 left-[-15%] h-112 w-md rounded-full bg-sky-500/20 blur-3xl home-animate-orbit-slow" />
        <div className="absolute bottom-0 right-10 h-60 w-60 rounded-full bg-emerald-400/10 blur-3xl home-animate-float" />
      </div>

      <header className="relative px-6 pt-20 pb-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.3em] text-teal-200/80 home-animate-fade-up home-animate-delay-1">
              HireNowPro - Initial Interview Platform
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight text-white sm:text-5xl lg:text-6xl home-animate-fade-up home-animate-delay-2">
              AI-assisted interviews. Human-led decisions.
            </h1>
            <p className="mt-5 text-lg text-slate-200/80 home-animate-fade-up home-animate-delay-3">
              HireNowPro helps HR teams screen candidates fairly using AI - without removing human judgment.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 home-animate-fade-up home-animate-delay-4">
              <Link
                href="/positions"
                className="rounded-full bg-teal-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-teal-300"
              >
                Try Demo / Request Access
              </Link>
              <a
                href="#how-it-works"
                className="rounded-full border border-white/30 px-6 py-3 text-base font-semibold text-white transition hover:border-white/60 hover:text-white"
              >
                See How It Works
              </a>
            </div>
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 home-animate-fade-in home-animate-delay-5">
            {FEATURES.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:border-teal-300/50 hover:bg-white/10"
              >
                <p className="text-sm font-semibold text-teal-200">{item}</p>
              </li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}
