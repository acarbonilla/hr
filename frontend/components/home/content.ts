export const DIFFERENTIATORS = [
  {
    title: "Human decision preserved",
    description: "AI assists with signals, while HR remains the final decision maker.",
  },
  {
    title: "No blind AI rejection",
    description: "Applicants are never rejected by AI alone.",
  },
  {
    title: "Transparent signals",
    description: "Scoring and insights are structured and explainable.",
  },
  {
    title: "Fair to applicants",
    description: "Designed for consistency, clarity, and respectful review.",
  },
] as const;

export const FEATURES = [
  "Initial Interview automation",
  "Competency-based scoring",
  "Authenticity signals (advisory only)",
  "Async processing (fast, non-blocking)",
] as const;

export const STEPS = [
  { label: "Applicant registration", detail: "Fast, lightweight signup for candidates." },
  { label: "AI-assisted interview", detail: "Structured video responses at the applicant's pace." },
  { label: "HR review & insights", detail: "Clear summaries and evidence-based signals." },
  { label: "Human decision", detail: "Final call stays with HR leaders." },
] as const;
