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
 * NFL Week 1 kickoff per year. Used as the date picker's max.
 * Add each new year as the schedule is announced.
 */
export const NFL_SEASON_OPENERS: Record<number, string> = {
  2024: "2024-09-05",
  2025: "2025-09-04",
  2026: "2026-09-10",
  2027: "2027-09-09",
};

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

export function getCurrentNflOpenerDate(year = CURRENT_YEAR): Date {
  const iso = NFL_SEASON_OPENERS[year] ?? `${year}-09-07`;
  return new Date(`${iso}T00:00:00`);
}

export function getEarliestSelectableEndDate(year = CURRENT_YEAR): Date {
  return new Date(`${year}-${EARLIEST_HISTORICAL_FILL_MMDD}T00:00:00`);
}