/**
 * Historical reference data for Best Ball Mania scheduling.
 *
 * Data is derived from 4 years of real BBM finalist drafts (II–V, 2021–2024)
 * and lives in `src/data/bbm-finalist-history.ts`. This file is a thin
 * adapter that re-exports those constants under the names the scheduler /
 * analysis / form components already use.
 */

import {
  EARLIEST_FINALIST_MMDD,
  FINALIST_DAILY_DISTRIBUTION,
  FINALIST_HISTORY_BY_YEAR,
  FINALIST_MONTH_BREAKDOWN_AVG,
  FINALIST_TOTAL_ALL_YEARS,
  LATEST_FINALIST_MMDD,
  type MonthBreakdownEntry as MonthBreakdownEntryT,
  type YearHistory as YearHistoryT,
} from "@/data/bbm-finalist-history";

export const CURRENT_YEAR = new Date().getFullYear();

/** Earliest finalist fill date across BBM II–V (used as date-picker min). */
export const EARLIEST_HISTORICAL_FILL_MMDD = EARLIEST_FINALIST_MMDD;

/** Latest finalist fill date across BBM II–V (used as date-picker max). */
export const LATEST_COMPLETION_MMDD = LATEST_FINALIST_MMDD;

/**
 * BBM officially opens the Monday after the NFL Draft. The NFL Draft is
 * typically the last weekend in April. Update yearly with the actual date.
 */
export const BBM_OPEN_DATES: Record<number, string> = {
  2024: "2024-04-29",
  2025: "2025-04-28",
  2026: "2026-04-27",
  2027: "2027-04-26",
};

/**
 * 4-year-averaged daily finalist distribution (BBM II–V), indexed across
 * the canonical 04-29 .. 09-09 month-day axis. Sums to 1.
 */
export const FINALIST_DRAFT_DISTRIBUTION: readonly number[] =
  FINALIST_DAILY_DISTRIBUTION;

export type MonthBreakdownEntry = MonthBreakdownEntryT;
export type YearHistory = YearHistoryT;

/** Total finalist drafts across all 4 years (BBM II–V). */
export const FINALIST_TOTAL = FINALIST_TOTAL_ALL_YEARS;

/** 4-year-averaged monthly breakdown. `count` is the average per-year count. */
export const FINALIST_MONTH_BREAKDOWN: readonly MonthBreakdownEntry[] =
  FINALIST_MONTH_BREAKDOWN_AVG;

/** Per-year history (BBM II, III, IV, V). */
export const FINALIST_HISTORY = FINALIST_HISTORY_BY_YEAR;

export function getCurrentBbmOpenDate(year = CURRENT_YEAR): Date {
  const iso = BBM_OPEN_DATES[year] ?? `${year}-04-29`;
  return new Date(`${iso}T00:00:00`);
}

export function getLatestCompletionDate(year = CURRENT_YEAR): Date {
  return new Date(`${year}-${LATEST_COMPLETION_MMDD}T00:00:00`);
}

export function getEarliestSelectableEndDate(year = CURRENT_YEAR): Date {
  return new Date(`${year}-${EARLIEST_HISTORICAL_FILL_MMDD}T00:00:00`);
}

/**
 * Today's date in America/Los_Angeles (Pacific) as a local Date at midnight.
 */
export function getTodayInPacific(): Date {
  const s = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [m, d, y] = s.split(/[\/,\s]/).filter(Boolean);
  return new Date(`${y}-${m}-${d}T00:00:00`);
}

/**
 * Day-of-week relative weights (Sun..Sat). Mirrors the observed pattern that
 * drafters are more active on Sundays and weekday evenings, less on Fridays.
 * Used by the scheduler so daily counts don't always pile onto Monday.
 */
export const DAY_OF_WEEK_WEIGHTS: number[] = [
  1.25, // Sun
  1.05, // Mon
  0.95, // Tue
  0.95, // Wed
  1.0,  // Thu
  0.85, // Fri
  0.95, // Sat
];