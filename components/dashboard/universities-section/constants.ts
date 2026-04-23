import type { AmountRangeFilter, GpaRangeFilter } from "./types";

export const amountRangeMap: Record<
  AmountRangeFilter,
  { min?: number; max?: number }
> = {
  all: {},
  "under-40000": { max: 40000 },
  "40000-60000": { min: 40000, max: 60000 },
  "60000-80000": { min: 60000, max: 80000 },
  "over-80000": { min: 80000 },
};

export const gpaRangeMap: Record<
  GpaRangeFilter,
  { min?: number; max?: number }
> = {
  all: {},
  "under-3.2": { max: 3.2 },
  "3.2-3.5": { min: 3.2, max: 3.5 },
  "3.5-3.8": { min: 3.5, max: 3.8 },
  "3.8-4.0": { min: 3.8, max: 4.0 },
};
