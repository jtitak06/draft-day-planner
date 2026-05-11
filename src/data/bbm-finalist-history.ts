// AUTO-GENERATED from src/data/raw/*.csv. Do not edit by hand.
// Source: 4 years of Best Ball Mania finalist data (BBM II–V, 2021–2024).
// Fields used: draft_filled_time (BBM IV, V); draft_time (BBM II, III — no fill
//   time available in those years, draft_time is the next-best proxy).

export type MonthBreakdownEntry = {
  month: string;
  monthIndex: number;
  count: number;
  pct: number;
};

export type YearHistory = {
  label: string;
  year: number;
  total: number;
  field: 'draft_filled_time' | 'draft_time';
  earliestMMDD: string;
  latestMMDD: string;
  monthly: MonthBreakdownEntry[];
};

/** Canonical month-day axis (04-29 .. 09-09), 134 days */
export const FINALIST_DAILY_AXIS_MMDD: readonly string[] = [
  "04-29", "04-30", "05-01", "05-02", "05-03", "05-04", "05-05", "05-06", "05-07", "05-08",
  "05-09", "05-10", "05-11", "05-12", "05-13", "05-14", "05-15", "05-16", "05-17", "05-18",
  "05-19", "05-20", "05-21", "05-22", "05-23", "05-24", "05-25", "05-26", "05-27", "05-28",
  "05-29", "05-30", "05-31", "06-01", "06-02", "06-03", "06-04", "06-05", "06-06", "06-07",
  "06-08", "06-09", "06-10", "06-11", "06-12", "06-13", "06-14", "06-15", "06-16", "06-17",
  "06-18", "06-19", "06-20", "06-21", "06-22", "06-23", "06-24", "06-25", "06-26", "06-27",
  "06-28", "06-29", "06-30", "07-01", "07-02", "07-03", "07-04", "07-05", "07-06", "07-07",
  "07-08", "07-09", "07-10", "07-11", "07-12", "07-13", "07-14", "07-15", "07-16", "07-17",
  "07-18", "07-19", "07-20", "07-21", "07-22", "07-23", "07-24", "07-25", "07-26", "07-27",
  "07-28", "07-29", "07-30", "07-31", "08-01", "08-02", "08-03", "08-04", "08-05", "08-06",
  "08-07", "08-08", "08-09", "08-10", "08-11", "08-12", "08-13", "08-14", "08-15", "08-16",
  "08-17", "08-18", "08-19", "08-20", "08-21", "08-22", "08-23", "08-24", "08-25", "08-26",
  "08-27", "08-28", "08-29", "08-30", "08-31", "09-01", "09-02", "09-03", "09-04", "09-05",
  "09-06", "09-07", "09-08", "09-09",
];

export const FINALIST_HISTORY_BY_YEAR: readonly YearHistory[] = [
  {
    label: "BBM II",
    year: 2021,
    total: 160,
    field: "draft_time",
    earliestMMDD: "05-03",
    latestMMDD: "09-09",
    monthly: [
      { month: "April", monthIndex: 4, count: 0, pct: 0.000000 },
      { month: "May", monthIndex: 5, count: 22, pct: 0.137500 },
      { month: "June", monthIndex: 6, count: 18, pct: 0.112500 },
      { month: "July", monthIndex: 7, count: 37, pct: 0.231250 },
      { month: "August", monthIndex: 8, count: 55, pct: 0.343750 },
      { month: "September", monthIndex: 9, count: 28, pct: 0.175000 },
    ],
  },
  {
    label: "BBM III",
    year: 2022,
    total: 469,
    field: "draft_time",
    earliestMMDD: "05-02",
    latestMMDD: "09-08",
    monthly: [
      { month: "April", monthIndex: 4, count: 0, pct: 0.000000 },
      { month: "May", monthIndex: 5, count: 47, pct: 0.100213 },
      { month: "June", monthIndex: 6, count: 50, pct: 0.106610 },
      { month: "July", monthIndex: 7, count: 100, pct: 0.213220 },
      { month: "August", monthIndex: 8, count: 193, pct: 0.411514 },
      { month: "September", monthIndex: 9, count: 79, pct: 0.168443 },
    ],
  },
  {
    label: "BBM IV",
    year: 2023,
    total: 441,
    field: "draft_filled_time",
    earliestMMDD: "04-29",
    latestMMDD: "09-06",
    monthly: [
      { month: "April", monthIndex: 4, count: 5, pct: 0.011338 },
      { month: "May", monthIndex: 5, count: 49, pct: 0.111111 },
      { month: "June", monthIndex: 6, count: 56, pct: 0.126984 },
      { month: "July", monthIndex: 7, count: 106, pct: 0.240363 },
      { month: "August", monthIndex: 8, count: 166, pct: 0.376417 },
      { month: "September", monthIndex: 9, count: 59, pct: 0.133787 },
    ],
  },
  {
    label: "BBM V",
    year: 2024,
    total: 539,
    field: "draft_filled_time",
    earliestMMDD: "04-29",
    latestMMDD: "08-31",
    monthly: [
      { month: "April", monthIndex: 4, count: 12, pct: 0.022263 },
      { month: "May", monthIndex: 5, count: 86, pct: 0.159555 },
      { month: "June", monthIndex: 6, count: 77, pct: 0.142857 },
      { month: "July", monthIndex: 7, count: 95, pct: 0.176252 },
      { month: "August", monthIndex: 8, count: 269, pct: 0.499072 },
      { month: "September", monthIndex: 9, count: 0, pct: 0.000000 },
    ],
  },
];

/** 4-year averaged daily distribution (per-year normalized, then averaged). Sums to 1. */
export const FINALIST_DAILY_DISTRIBUTION: readonly number[] = [
  0.003814, 0.004587, 0.003350, 0.004124, 0.007681, 0.004416, 0.006218, 0.004122,
  0.006478, 0.005412, 0.004089, 0.001134, 0.002559, 0.005189, 0.005894, 0.004191,
  0.005083, 0.005548, 0.003797, 0.001031, 0.003487, 0.002491, 0.004088, 0.001461,
  0.005083, 0.004655, 0.002166, 0.005756, 0.003556, 0.004088, 0.001564, 0.002628,
  0.005755, 0.004862, 0.004345, 0.001855, 0.000533, 0.005085, 0.002989, 0.001667,
  0.001925, 0.005188, 0.001563, 0.003625, 0.003163, 0.006117, 0.006786, 0.003161,
  0.005223, 0.005687, 0.003488, 0.003058, 0.004656, 0.003659, 0.005260, 0.002490,
  0.005996, 0.005188, 0.004191, 0.007679, 0.003418, 0.004588, 0.004793, 0.008246,
  0.008006, 0.002594, 0.006392, 0.002955, 0.003694, 0.004194, 0.005086, 0.002594,
  0.000997, 0.005548, 0.002097, 0.004089, 0.003092, 0.006357, 0.002097, 0.009311,
  0.004761, 0.007133, 0.005996, 0.011440, 0.009276, 0.010941, 0.012814, 0.011975,
  0.007784, 0.006787, 0.007355, 0.012248, 0.014240, 0.015172, 0.009621, 0.011012,
  0.005394, 0.008676, 0.011903, 0.005585, 0.012541, 0.008488, 0.010736, 0.009379,
  0.010394, 0.017660, 0.010534, 0.010943, 0.014794, 0.013969, 0.012368, 0.012011,
  0.010276, 0.010138, 0.018192, 0.015787, 0.013438, 0.016955, 0.016547, 0.014933,
  0.016357, 0.020483, 0.017408, 0.024912, 0.016258, 0.009228, 0.011391, 0.013058,
  0.018490, 0.019449, 0.022010, 0.012114, 0.005754, 0.007812,
];

export const FINALIST_MONTH_BREAKDOWN_AVG: readonly MonthBreakdownEntry[] = [
  { month: "April", monthIndex: 4, count: 4, pct: 0.008400 },
  { month: "May", monthIndex: 5, count: 51, pct: 0.127095 },
  { month: "June", monthIndex: 6, count: 50, pct: 0.122238 },
  { month: "July", monthIndex: 7, count: 84, pct: 0.215271 },
  { month: "August", monthIndex: 8, count: 171, pct: 0.407688 },
  { month: "September", monthIndex: 9, count: 42, pct: 0.119308 },
];

export const EARLIEST_FINALIST_MMDD = "04-29";
export const LATEST_FINALIST_MMDD = "09-09";

export const FINALIST_TOTAL_ALL_YEARS = 1609;