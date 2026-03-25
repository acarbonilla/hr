"use client";

import { motion, useReducedMotion } from "framer-motion";

import PositionDetailModal from "@/components/PositionDetailModal";
import {
  PositionsFilters,
  PositionsGrid,
  PositionsPageHeader,
  PositionsPagination,
  ResumeInterviewBanner,
  useOpenPositions,
} from "@/components/positions";
import { HomePageFooter } from "@/components/home";

export default function OpenPositionsPage() {
  const shouldReduceMotion = useReducedMotion();
  const {
    loading,
    keyword,
    categoryFilter,
    locationFilter,
    resumeIntent,
    selectedPosition,
    filteredPositions,
    paginatedPositions,
    totalPages,
    currentPage,
    focusedIndex,
    categories,
    setKeyword,
    setCategoryFilter,
    setLocationFilter,
    setFocusedIndex,
    handleApply,
    handleCloseModal,
    handleOpenPosition,
    handleResumeInterview,
    setCardRef,
    goToPreviousPage,
    goToNextPage,
  } = useOpenPositions();

  const containerMotion = {
    initial: shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-teal-300 mx-auto" />
          <p className="mt-4 text-slate-200">Loading positions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <PositionsPageHeader />

      <section className="relative overflow-hidden px-6 pb-8 pt-6 sm:px-10 lg:px-16">
        <div className="absolute -top-24 right-[-10%] h-56 w-56 rounded-full bg-teal-400/16 blur-3xl" />
        <div className="absolute bottom-0 left-[-10%] h-56 w-56 rounded-full bg-sky-400/12 blur-3xl" />

        <motion.div {...containerMotion} className="mx-auto max-w-6xl space-y-5">
          {resumeIntent && <ResumeInterviewBanner resumeIntent={resumeIntent} onResume={handleResumeInterview} />}

          <PositionsFilters
            keyword={keyword}
            categoryFilter={categoryFilter}
            locationFilter={locationFilter}
            categories={categories}
            onKeywordChange={setKeyword}
            onCategoryChange={setCategoryFilter}
            onLocationChange={setLocationFilter}
          />
        </motion.div>
      </section>

      <section className="bg-white px-6 py-14 text-slate-900 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Available Opportunities</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Choose a role and review the details first</h2>
              <p className="mt-2 text-slate-600">
                {filteredPositions.length} open positions available right now. Start when you feel ready.
              </p>
            </div>
            <span className="text-xs uppercase tracking-[0.3em] text-teal-600">Simple First Step</span>
          </div>

          <PositionsGrid
            positions={paginatedPositions}
            focusedIndex={focusedIndex}
            onFocusCard={setFocusedIndex}
            onOpenPosition={handleOpenPosition}
            setCardRef={setCardRef}
          />

          {filteredPositions.length > 0 && (
            <PositionsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPrevious={goToPreviousPage}
              onNext={goToNextPage}
            />
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Initial Interview Only</span>
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">No Documents Required Yet</span>
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Review Details First</span>
            <span className="rounded-full bg-white px-3 py-2 ring-1 ring-slate-200">Human-Guided Process</span>
          </div>
        </div>
      </section>

      <PositionDetailModal
        isOpen={!!selectedPosition}
        position={selectedPosition}
        onClose={handleCloseModal}
        onApply={handleApply}
      />
      <HomePageFooter />
    </div>
  );
}
