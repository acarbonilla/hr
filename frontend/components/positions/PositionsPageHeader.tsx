import Link from "next/link";

export default function PositionsPageHeader() {
  return (
    <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-6 py-5 sm:px-10 lg:px-16">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-teal-200/80">HireNowPro Careers</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Open Positions</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
              Review the role details first, then begin with a simple initial interview when you are ready.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-200">
              <span className="rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1.5 text-teal-100">
                Fast First Step
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">No Resume Yet</span>
            </div>
          </div>
          <div className="flex items-center gap-3 lg:pb-1">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/50"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
