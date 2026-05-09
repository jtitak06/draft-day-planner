import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfWeek,
} from "date-fns";

export type DayPlan = { date: string; count: number };
export type WeekPlan = {
  weekStart: string;
  count: number;
  pct: number;
  cumulative: number;
};

export type Schedule = {
  days: DayPlan[];
  weeks: WeekPlan[];
  totalEntries: number;
  startDate: string;
  endDate: string;
};

export type ComputeScheduleInput = {
  startDate: Date;
  endDate: Date;
  totalEntries: number;
  /** Historical weekly weights (will be resampled to fit the window). */
  weights: number[];
};

/**
 * Resample an array of weights to a target length using linear interpolation.
 * This lets us stretch/squeeze the historical distribution to match whatever
 * window the user selects.
 */
function resampleWeights(weights: number[], targetLen: number): number[] {
  if (targetLen <= 0) return [];
  if (weights.length === 0) return new Array(targetLen).fill(1);
  if (targetLen === 1) return [weights.reduce((a, b) => a + b, 0)];

  const out: number[] = new Array(targetLen);
  for (let i = 0; i < targetLen; i++) {
    const t = (i / (targetLen - 1)) * (weights.length - 1);
    const lo = Math.floor(t);
    const hi = Math.min(weights.length - 1, lo + 1);
    const frac = t - lo;
    out[i] = weights[lo] * (1 - frac) + weights[hi] * frac;
  }
  return out;
}

/**
 * Allocate `total` items into `n` buckets proportional to `weights` using
 * the largest-remainder method, so the integer counts sum exactly to total.
 */
function largestRemainderAllocate(
  total: number,
  weights: number[],
): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  if (sum <= 0 || total <= 0) return new Array(weights.length).fill(0);

  const exact = weights.map((w) => (w / sum) * total);
  const floors = exact.map((x) => Math.floor(x));
  let assigned = floors.reduce((a, b) => a + b, 0);
  const remainders = exact.map((x, i) => ({ i, r: x - Math.floor(x) }));
  remainders.sort((a, b) => b.r - a.r);
  let k = 0;
  while (assigned < total && k < remainders.length) {
    floors[remainders[k].i] += 1;
    assigned += 1;
    k += 1;
  }
  return floors;
}

export function computeSchedule(input: ComputeScheduleInput): Schedule {
  const start = startOfDay(input.startDate);
  const end = startOfDay(input.endDate);
  const totalDays = Math.max(1, differenceInCalendarDays(end, start) + 1);
  const totalWeeks = Math.max(1, Math.ceil(totalDays / 7));

  const resampled = resampleWeights(input.weights, totalWeeks);
  const perWeek = largestRemainderAllocate(input.totalEntries, resampled);

  // Build day-level plan: spread each week's count across its 7 days
  // (or fewer for the final partial week) using even allocation.
  const days: DayPlan[] = [];
  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = addDays(start, w * 7);
    const daysInBucket = Math.min(
      7,
      differenceInCalendarDays(end, weekStart) + 1,
    );
    const dayWeights = new Array(daysInBucket).fill(1);
    const perDay = largestRemainderAllocate(perWeek[w], dayWeights);
    for (let d = 0; d < daysInBucket; d++) {
      days.push({
        date: format(addDays(weekStart, d), "yyyy-MM-dd"),
        count: perDay[d],
      });
    }
  }

  // Build week summary keyed by ISO-week-ish (Monday-anchored for display).
  const weeks: WeekPlan[] = [];
  let cumulative = 0;
  for (let w = 0; w < totalWeeks; w++) {
    const weekStart = addDays(start, w * 7);
    const monday = startOfWeek(weekStart, { weekStartsOn: 1 });
    cumulative += perWeek[w];
    weeks.push({
      weekStart: format(monday, "yyyy-MM-dd"),
      count: perWeek[w],
      pct: input.totalEntries > 0 ? perWeek[w] / input.totalEntries : 0,
      cumulative,
    });
  }

  return {
    days,
    weeks,
    totalEntries: input.totalEntries,
    startDate: format(start, "yyyy-MM-dd"),
    endDate: format(end, "yyyy-MM-dd"),
  };
}

export function scheduleToCsv(schedule: Schedule): string {
  const rows = [["date", "drafts"]];
  for (const d of schedule.days) {
    if (d.count > 0) rows.push([d.date, String(d.count)]);
  }
  return rows.map((r) => r.join(",")).join("\n");
}