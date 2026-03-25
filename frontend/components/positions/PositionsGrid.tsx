import { motion, useReducedMotion } from "framer-motion";

import type { JobPosition } from "@/types";

import PositionCard from "./PositionCard";

interface PositionsGridProps {
  positions: JobPosition[];
  focusedIndex: number | null;
  onFocusCard: (index: number) => void;
  onOpenPosition: (position: JobPosition, index: number) => void;
  setCardRef: (index: number, element: HTMLDivElement | null) => void;
}

export default function PositionsGrid({
  positions,
  focusedIndex,
  onFocusCard,
  onOpenPosition,
  setCardRef,
}: PositionsGridProps) {
  const shouldReduceMotion = useReducedMotion();

  const listVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.05 } },
      };

  const cardVariants = shouldReduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      };

  if (positions.length === 0) {
    return (
      <div className="mt-10 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-10 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-teal-600">No Match Yet</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">No roles match your current filters.</h3>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
          Try a broader keyword, switch the category back to all, or search by a different city or remote setup.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={listVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="show"
      className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      {positions.map((position, index) => (
        <motion.div
          key={position.id}
          variants={cardVariants}
          whileHover={shouldReduceMotion ? {} : { y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <PositionCard
            position={position}
            index={index}
            focused={focusedIndex === index}
            setCardRef={setCardRef}
            onOpen={() => onOpenPosition(position, index)}
            onFocus={() => onFocusCard(index)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
