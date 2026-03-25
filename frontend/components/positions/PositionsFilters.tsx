import type { PositionCategory } from "./types";

interface PositionsFiltersProps {
  keyword: string;
  categoryFilter: string;
  locationFilter: string;
  categories: PositionCategory[];
  onKeywordChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onLocationChange: (value: string) => void;
}

export default function PositionsFilters({
  keyword,
  categoryFilter,
  locationFilter,
  categories,
  onKeywordChange,
  onCategoryChange,
  onLocationChange,
}: PositionsFiltersProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Filter Positions</p>
        <p className="text-xs text-slate-400">Search by role, category, or location.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Role</label>
          <input
            value={keyword}
            onChange={(event) => onKeywordChange(event.target.value)}
            placeholder="Search for support, tech, assistant, and more"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Category</label>
          <select
            value={categoryFilter}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">Location</label>
          <input
            value={locationFilter}
            onChange={(event) => onLocationChange(event.target.value)}
            placeholder="City or remote"
            className="mt-2 w-full rounded-xl border border-white/10 bg-slate-950/60 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-400/40"
          />
        </div>
      </div>
    </div>
  );
}
