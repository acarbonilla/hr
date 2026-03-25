import type { ResumeIntent } from "./types";

interface ResumeInterviewBannerProps {
  resumeIntent: ResumeIntent;
  onResume: () => void;
}

export default function ResumeInterviewBanner({ resumeIntent, onResume }: ResumeInterviewBannerProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-teal-300/40 bg-white/5 p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-semibold text-teal-200">You have an interview in progress.</p>
        <p className="text-slate-300">
          Resume where you left off{resumeIntent.position ? ` for ${resumeIntent.position}.` : " for this position."}
        </p>
      </div>
      <button
        onClick={onResume}
        className="rounded-full bg-teal-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-teal-300"
      >
        Resume Interview
      </button>
    </div>
  );
}
