/**
 * Historical reference data for Best Ball Mania scheduling.
 *
 * Edit these constants to refine the scheduler. All dates are stored as
 * MM-DD strings (year-agnostic) so we can map them onto the current cycle.
 */

export const CURRENT_YEAR = new Date().getFullYear();

/**
 * Earliest date a BBM finalist team was drafted in BBM V (2024).
 * The date picker uses this — projected onto the current year — as its min.
 */
export const EARLIEST_HISTORICAL_FILL_MMDD = "06-02";

/**
 * Latest date a BBM V (2024) finalist team was drafted. No finalist team
 * was drafted in September. The date picker uses this — projected onto the
 * current year — as its max.
 */
export const LATEST_COMPLETION_MMDD = "08-31";

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
 * Real BBM V (2024) finalist draft distribution — daily counts of finalist
 * teams by `draft_filled_time`, indexed from the BBM open day (2024-04-29)
 * through 2024-08-31 (125 days). Source: 539 finalist drafts.
 * No finalist team was drafted in September.
 */
export const FINALIST_DRAFT_DISTRIBUTION: number[] = [
  7, 5, 6, 3, 5, 6, 4, 1, 6, 6, 2, 0, 1, 2, 2, 0, 3, 5, 1, 1, 3, 3, 3, 2, 3,
  3, 0, 2, 4, 3, 1, 2, 3, 2, 6, 4, 0, 4, 4, 0, 3, 3, 0, 3, 1, 4, 2, 2, 2, 3,
  4, 3, 2, 1, 2, 2, 0, 3, 2, 6, 4, 4, 1, 6, 8, 2, 3, 4, 2, 2, 5, 2, 1, 5, 1,
  4, 3, 2, 1, 3, 2, 0, 0, 3, 4, 3, 1, 6, 4, 3, 4, 4, 2, 5, 3, 3, 1, 7, 3, 5,
  6, 3, 8, 5, 12, 10, 11, 4, 14, 6, 7, 6, 8, 8, 9, 12, 10, 10, 15, 10, 10,
  14, 20, 15, 14,
];

/**
 * BBM V (2024) finalist teams by month, derived from the same source.
 * Total finalists: 539. April covers the open week only (4/29–4/30).
 */
export type MonthBreakdownEntry = {
  month: string; // e.g. "August"
  monthIndex: number; // 1-12
  count: number;
  pct: number; // 0..1
};

export const FINALIST_TOTAL = 539;

export const FINALIST_MONTH_BREAKDOWN: MonthBreakdownEntry[] = [
  { month: "April (open week)", monthIndex: 4, count: 12, pct: 12 / 539 },
  { month: "May", monthIndex: 5, count: 86, pct: 86 / 539 },
  { month: "June", monthIndex: 6, count: 77, pct: 77 / 539 },
  { month: "July", monthIndex: 7, count: 95, pct: 95 / 539 },
  { month: "August", monthIndex: 8, count: 269, pct: 269 / 539 },
  { month: "September", monthIndex: 9, count: 0, pct: 0 },
];

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