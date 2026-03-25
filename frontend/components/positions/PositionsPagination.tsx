interface PositionsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function PositionsPagination({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: PositionsPaginationProps) {
  return (
    <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-[1.75rem] border border-slate-200 bg-gradient-to-r from-white to-slate-50 px-6 py-5 text-sm text-slate-600">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">Browse More Roles</p>
        <p className="mt-2 font-semibold text-slate-700">
          Viewing page {currentPage} of {totalPages}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous Page
        </button>
        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next Page
        </button>
      </div>
    </div>
  );
}
