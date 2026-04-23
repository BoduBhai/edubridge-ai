import type { AmountRangeFilter, GpaRangeFilter } from "./types";

export const amountRangeMap: Record<
  AmountRangeFilter,
  { min?: number; max?: number }
> = {
  all: {},
  "under-10000": { max: 10000 },
  "10000-30000": { min: 10000, max: 30000 },
  "30000-60000": { min: 30000, max: 60000 },
  "over-60000": { min: 60000 },
};

export const gpaRangeMap: Record<
  GpaRangeFilter,
  { min?: number; max?: number }
> = {
  all: {},
  "under-3.0": { max: 3.0 },
  "3.0-3.4": { min: 3.0, max: 3.4 },
  "3.4-3.7": { min: 3.4, max: 3.7 },
  "3.7-4.0": { min: 3.7, max: 4.0 },
};
