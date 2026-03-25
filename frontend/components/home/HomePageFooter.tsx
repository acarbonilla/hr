export default function HomePageFooter() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 px-6 py-12 text-sm text-slate-400 sm:px-10 lg:px-16">
      <div className="mx-auto max-w-6xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <div className="inline-flex rounded-full border border-teal-300/30 bg-teal-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-200">
              Portfolio Project
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white sm:text-3xl">HireNowPro</h2>
              <p className="max-w-xl text-sm leading-7 text-slate-300">
                HireNowPro is a portfolio project by ACarbonilla. Built with AI assistance and guided by human
                judgment.
              </p>
            </div>
          </div>

          <div className="space-y-4 lg:pl-8 lg:border-l lg:border-white/10">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Project Notes</p>
              <p className="leading-7 text-slate-300">The domain iais.online is used for portfolio purposes.</p>
            </div>
            <div className="h-px bg-white/10" />
            <p className="text-sm text-slate-500">&copy; 2026 HireNowPro. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
