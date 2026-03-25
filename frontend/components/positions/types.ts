import type { JobPosition } from "@/types";

export type PositionCategory = NonNullable<JobPosition["category_detail"]>;

export interface ResumeIntent {
  interviewId: number;
  position?: string;
}
