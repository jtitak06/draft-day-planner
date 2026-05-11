import { differenceInCalendarDays, format, parseISO } from "date-fns";
import {
  FINALIST_MONTH_BREAKDOWN,
  FINALIST_TOTAL,
} from "./historical-config";

export type Severity = "optimal" | "reasonable" | "suboptimal";

export type WindowAnalysis = {
  severity: Severity;
  windowFraction: number; // 0..1, share of historical finalist weight inside window
  missedAfterFraction: number; // share that historically came AFTER user's end date
  missedBeforeFraction: number; // share before user's start
  peakDate: string; // ISO date of historical peak inside the full cycle
  daysInWindow: number;
  draftsPerDay: number;
  headline: string;
  details: string[];
  historyBullets: string[]; // BBM V monthly breakdown
  suggestionBullets: string[]; // dynamic suggestions vs user window
};

function cdf(weights: readonly number[], t: number): number {
  // t in [0,1] across the weights array; returns cumulative fraction.
  if (weights.length === 0) return 0;
  const total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const x = t * (weights.length - 1);
  const lo = Math.floor(x);
  const frac = x - lo;
  let cum = 0;
  for (let i = 0; i < lo; i++) cum += weights[i];
  cum += weights[lo] * frac;
  return cum / total;
}

export function analyzeWindow(args: {
  cycleStart: Date;
  cycleEnd: Date;
  windowStart: Date;
  windowEnd: Date;
  weights: readonly number[];
  remaining: number;
  completed: number;
}): WindowAnalysis {
  const { cycleStart, cycleEnd, windowStart, windowEnd, weights, remaining, completed } = args;
  const cycleDays = Math.max(1, differenceInCalendarDays(cycleEnd, cycleStart));
  const tStart = Math.max(
    0,
    Math.min(1, differenceInCalendarDays(windowStart, cycleStart) / cycleDays),
  );
  const tEnd = Math.max(
    0,
    Math.min(1, differenceInCalendarDays(windowEnd, cycleStart) / cycleDays),
  );

  const windowFraction = Math.max(0, cdf(weights, tEnd) - cdf(weights, tStart));
  const missedAfterFraction = Math.max(0, 1 - cdf(weights, tEnd));
  const missedBeforeFraction = Math.max(0, cdf(weights, tStart));

  // Peak weight bucket → date along the cycle
  let peakIdx = 0;
  for (let i = 1; i < weights.length; i++) {
    if (weights[i] > weights[peakIdx]) peakIdx = i;
  }
  const peakT = weights.length > 1 ? peakIdx / (weights.length - 1) : 0.5;
  const peakDay = new Date(
    cycleStart.getTime() + peakT * cycleDays * 24 * 60 * 60 * 1000,
  );
  const peakDate = format(peakDay, "yyyy-MM-dd");

  const daysInWindow = Math.max(
    1,
    differenceInCalendarDays(windowEnd, windowStart) + 1,
  );
  const draftsPerDay = remaining / daysInWindow;

  let severity: Severity;
  if (windowFraction >= 0.85) severity = "optimal";
  else if (windowFraction >= 0.55) severity = "reasonable";
  else severity = "suboptimal";

  const details: string[] = [];
  details.push(
    `Historically, ${(windowFraction * 100).toFixed(0)}% of Best Ball Mania finalist teams were drafted within a window like yours.`,
  );
  if (missedAfterFraction > 0.1) {
    details.push(
      `${(missedAfterFraction * 100).toFixed(0)}% of finalist teams have historically been drafted AFTER ${format(windowEnd, "MMM d")} — finishing earlier means missing late-summer ADP movement (injuries, depth-chart shifts, preseason news).`,
    );
  }
  if (missedBeforeFraction > 0.1) {
    details.push(
      `${(missedBeforeFraction * 100).toFixed(0)}% of finalist teams were drafted BEFORE ${format(windowStart, "MMM d")} — starting later means skipping the early-cycle weak-field edge.`,
    );
  }
  details.push(
    `Historical peak draft activity falls around ${format(peakDay, "MMM d")}.`,
  );
  details.push(
    `You'll need to draft ~${draftsPerDay.toFixed(1)} teams/day on average (${remaining} remaining over ${daysInWindow} days, with ${completed} already complete).`,
  );

  let headline: string;
  if (severity === "optimal") {
    headline = "Your window aligns well with historical finalist patterns.";
  } else if (severity === "reasonable") {
    headline = "Workable, but you'll miss part of the historical sweet spot.";
  } else {
    headline =
      "Not an optimal strategy — your window misses most of the historical finalist draft window. The schedule below still produces the best output for your chosen criteria.";
  }

  // Real BBM V monthly breakdown bullets
  const historyBullets = FINALIST_MONTH_BREAKDOWN.map((m) => {
    const pct = (m.pct * 100).toFixed(1);
    return `${m.month}: ${pct}% of finalist teams (${m.count} of ${FINALIST_TOTAL})`;
  });

  // Dynamic suggestions based on user window vs BBM V months
  const suggestionBullets: string[] = [];
  const winStartMonth = windowStart.getMonth() + 1; // 1-12
  const winEndMonth = windowEnd.getMonth() + 1;
  const winEndDay = windowEnd.getDate();
  const winStartDay = windowStart.getDate();

  const pctOf = (months: number[]) =>
    FINALIST_MONTH_BREAKDOWN.filter((m) => months.includes(m.monthIndex)).reduce(
      (a, b) => a + b.pct,
      0,
    );

  if (winEndMonth < 8 || (winEndMonth === 8 && winEndDay < 15)) {
    suggestionBullets.push(
      `You're finishing before mid-August. ~${(pctOf([8]) * 100).toFixed(0)}% of BBM V finalists were drafted in August — extending your window into late August would put you in the densest part of the finalist draft curve.`,
    );
  }
  if (winStartMonth > 6 || (winStartMonth === 6 && winStartDay > 15)) {
    suggestionBullets.push(
      `You're starting mid-June or later. ~${(pctOf([4, 5, 6]) * 100).toFixed(0)}% of BBM V finalists were drafted before then — starting earlier captures the soft-field, pre-camp portion of the cycle.`,
    );
  }
  if (
    winEndMonth === 8 &&
    winEndDay >= 20 &&
    (winStartMonth < 8 || (winStartMonth === 8 && winStartDay <= 15))
  ) {
    suggestionBullets.push(
      "Your window covers the late-August peak — last year ~35% of finalist teams filled in the final 10 days of August alone.",
    );
  }
  if (winEndMonth >= 9) {
    suggestionBullets.push(
      "No BBM V finalist team was drafted in September. Drafting after Aug 31 historically puts you outside the finalist window entirely.",
    );
  }
  if (suggestionBullets.length === 0) {
    suggestionBullets.push(
      "Your window covers the bulk of the BBM V finalist draft distribution — no major gaps to flag.",
    );
  }

  return {
    severity,
    windowFraction,
    missedAfterFraction,
    missedBeforeFraction,
    peakDate,
    daysInWindow,
    draftsPerDay,
    headline,
    details,
    historyBullets,
    suggestionBullets,
  };
}

export function formatPeakDate(iso: string): string {
  return format(parseISO(iso), "MMM d");
}