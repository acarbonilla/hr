import { ArrowRight, Briefcase, ClipboardList, Headset, MapPin, Megaphone, MessageSquare } from "lucide-react";
import type { LucideProps } from "lucide-react";

import { formatSalaryDisplay } from "@/lib/salary";
import type { JobPosition } from "@/types";

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  "virtual-assistant": Headset,
  VA: Headset,
  "customer-service": MessageSquare,
  CS: MessageSquare,
  "data-entry": ClipboardList,
  DE: ClipboardList,
  "social-media": Megaphone,
  IT: Briefcase,
};

const getPositionIcon = (code: string) => {
  const Icon = iconMap[code] || Briefcase;
  return <Icon className="h-6 w-6 text-teal-500" />;
};

interface PositionCardProps {
  position: JobPosition;
  index: number;
  focused: boolean;
  setCardRef: (index: number, element: HTMLDivElement | null) => void;
  onOpen: () => void;
  onFocus: () => void;
}

export default function PositionCard({
  position,
  index,
  focused,
  setCardRef,
  onOpen,
  onFocus,
}: PositionCardProps) {
  const salaryDisplay = formatSalaryDisplay(position);
  const summary =
    position.description?.trim() || "Learn more about the role, review the setup, and decide when you are ready to start.";
  const offices = position.offices_detail || [];

  return (
    <div
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.currentTarget !== event.target) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen();
        }
      }}
      onFocus={onFocus}
      role="button"
      tabIndex={0}
      ref={(element) => {
        setCardRef(index, element);
      }}
      className={`flex h-full cursor-pointer flex-col justify-between rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300/60 hover:shadow-[0_20px_60px_rgba(15,23,42,0.12)] focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:ring-offset-2 focus:ring-offset-white ${
        focused ? "ring-2 ring-teal-300/60 ring-offset-2 ring-offset-white" : ""
      }`}
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
              {getPositionIcon(position.code)}
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-teal-600">Open Role</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{position.name}</h3>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-600">
            Initial Interview
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {position.category_detail?.name && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              {position.category_detail.name}
            </span>
          )}
          {position.employment_type && (
            <span className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
              {position.employment_type}
            </span>
          )}
          {!position.employment_type && !position.category_detail?.name && (
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              Explore Details
            </span>
          )}
        </div>

        <p className="line-clamp-3 text-sm leading-6 text-slate-600">{summary}</p>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Location</p>
              <div className="flex flex-wrap gap-2">
                {offices.length > 0 ? (
                  offices.map((office) => (
                    <span
                      key={office.id}
                      className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200"
                    >
                      <MapPin className="mr-1 h-3 w-3 text-teal-600" />
                      {office.name}
                    </span>
                  ))
                ) : (
                  <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    Remote only
                  </span>
                )}
              </div>
            </div>
            {salaryDisplay && (
              <div className="min-w-0 text-right">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">{salaryDisplay.label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">{salaryDisplay.value}</p>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs leading-6 text-slate-500">
          Review the role details first, then start your initial interview when you are ready.
        </p>
      </div>

      <button
        onClick={(event) => {
          event.stopPropagation();
          onOpen();
        }}
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
      >
        View Role Details
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
