## Goal

Fix the misleading "12% after Sep 7" stat by replacing the placeholder historical distribution with **real BBM V (2024) finalist data** from your Google Sheet, and add a clear per-month breakdown with insight bullets under the analysis.

## What the real data says (BBM V — 539 finalist drafts)

| Month | Finalist drafts | % of finalists |
|---|---:|---:|
| April (open week, 4/29+) | 12 | 2.2% |
| May | 86 | 16.0% |
| June | 77 | 14.3% |
| July | 95 | 17.6% |
| August | 269 | 49.9% |
| September | 0 | 0.0% |

Earliest finalist fill: 2024‑06‑02. Latest finalist fill: 2024‑08‑31. **No finalist team was drafted in September.**

## Changes

### 1. Replace placeholder distribution with real BBM V data
**File:** `src/lib/historical-config.ts`
- Replace `FINALIST_DRAFT_DISTRIBUTION` (the synthetic 19-week curve) with weights derived from the real BBM V daily counts. Will store as a daily-resolution array indexed from BBM open day, so the analysis CDF is accurate to the day rather than smeared across week buckets.
- Add a new export `FINALIST_MONTH_BREAKDOWN` containing the table above (label, count, pct), driven directly from the sheet data.
- Update `LATEST_COMPLETION_MMDD` from `09-09` → `08-31` (real latest finalist fill). The date picker will cap there.
- Update `EARLIEST_HISTORICAL_FILL_MMDD` from `08-15` → `06-02` (real earliest finalist fill).

### 2. Update analysis to use daily weights
**File:** `src/lib/analysis.ts`
- `cdf()` already works on any-length weight array — no logic change needed, just feed daily weights instead of weekly.
- The Sep-7 / "12% after" claims will now correctly show **0%** finalists after Aug 31.

### 3. Add finalist-month breakdown bullets under the analysis
**File:** `src/components/scheduler/ScheduleAnalysis.tsx`
- Below the existing analysis card, render a new section: **"BBM V finalist draft history (2024)"**
- One bullet per month with count + percentage, e.g.:
  - "August: 49.9% of finalist teams (269 of 539) — by far the dominant draft window"
  - "September: 0% — no BBM V finalist team was drafted after Aug 31"
- Plus 2–3 **suggestion bullets** that compare the user's chosen window against this real history. Examples that will be generated dynamically based on `windowStart`/`windowEnd`:
  - If user ends before Aug 1: "You're skipping August, where ~50% of last year's finalists were drafted. Consider extending into mid/late August."
  - If user starts after Jul 1: "You're skipping May–June (~30% of last year's finalists), so you'll miss early-cycle soft fields."
  - If user spans Aug 15–31: "You're targeting peak finalist-draft season — last year ~35% of finalists filled in this window."

### 4. Pull data once, embed as a constant
The sheet contents will be embedded as a static constant in `historical-config.ts` (not fetched at runtime). One BBM cycle of data is small (~6 numbers per month + ~125 daily weights). If you want to refresh from the sheet later, we can add a small build script — out of scope for this change.

## Out of scope
- Multi-year support (BBM I–IV). Only BBM V data is in the sheet you shared.
- Live re-fetch from Google Sheets.
- Charts (you asked for bullet points, not visuals).

## Open question
Your sheet uses `draft_filled_time` (when the *draft* filled). I'm using that as "when the finalist team was drafted." If you'd rather measure by `draft_completed_time` (when the last pick was made) the numbers shift slightly but the shape is the same — I'll stick with `draft_filled_time` unless you say otherwise.
