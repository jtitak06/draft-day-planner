/**
 * Historical reference data for Best Ball Mania scheduling.
 *
 * Edit these constants to refine the scheduler. All dates are stored as
 * MM-DD strings (year-agnostic) so we can map them onto the current cycle.
 */

export const CURRENT_YEAR = new Date().getFullYear();

/**
 * Earliest date BBM has filled in any prior year (year-agnostic MM-DD).
 * The date picker uses this — projected onto the current year — as its min.
 * Update with the actual earliest historical fill date.
 */
export const EARLIEST_HISTORICAL_FILL_MMDD = "08-15";

/**
 * Latest selectable projected completion date (year-agnostic MM-DD).
 * The date picker uses this — projected onto the current year — as its max.
 */
export const LATEST_COMPLETION_MMDD = "09-09";

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
 * Historical distribution of when BBM finalist teams were drafted, by week
 * of the cycle (week 0 = open week). Values are weights; they will be
 * normalized at runtime so they don't have to sum to 1.
 *
 * Reference window: ~19 weeks (open through NFL Week 1). Replace with your
 * own values when you have them — these are reasonable seed defaults that
 * back-load drafts toward late August / early September, mirroring observed
 * finalist patterns from past BBMs.
 */
export const FINALIST_DRAFT_DISTRIBUTION: number[] = [
  0.5, // wk 0 — open week (low: sharps testing the waters)
  0.8,
  1.2,
  1.6,
  2.0,
  2.4,
  2.8, // mid May
  3.2,
  3.6,
  4.0,
  4.5,
  5.5,
  6.5, // mid July
  8.0,
  10.0,
  12.0,
  14.0, // mid-late Aug peak
  12.0,
  9.0, // final week pre-kickoff
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