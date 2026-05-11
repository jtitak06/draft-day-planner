## Goal

Replace the single-year (BBM V) placeholder-ish data with all 4 years of real finalist draft data (BBM II–V) embedded in the project. Drive the scheduler off the **4-year average distribution**, and show a **combined table-style bullet list** comparing all 4 years side-by-side in the analysis section.

## Confirmed inputs

- Source sheet: 4 tabs — `BBM II`, `BBM III`, `BBM IV`, `BBM V` (2021–2024).
- Same schema as before (`draft_filled_time` is the "finalist drafted on" field).
- Sheet is publicly readable, so I can pull each tab via the CSV export endpoint without needing a connector.
- One sheet with 4 tabs is fine — no need to split into 4 docs.

## Architecture: embed, don't fetch live

I'll do the data work once (during implementation), aggregate it, and commit static TypeScript constants. The app makes zero network calls for this data.

```
src/data/
  raw/
    bbm-ii.csv          ← committed for auditability, not imported by app
    bbm-iii.csv
    bbm-iv.csv
    bbm-v.csv
  bbm-finalist-history.ts ← the only file the app imports
```

`bbm-finalist-history.ts` exports, per-year and combined:
- daily counts indexed from each year's BBM open day through that year's last finalist fill
- monthly breakdown (April–September): count + pct
- earliest finalist fill date and latest finalist fill date
- a **combined 4-year-average daily distribution** normalized onto a common month-of-year axis (so years with different open dates align), used by the scheduler
- a combined monthly breakdown averaging the 4 years

## Changes

### 1. Pull and embed the data
- Fetch each tab as CSV (already verified accessible).
- Save raw CSVs to `src/data/raw/`.
- Build `src/data/bbm-finalist-history.ts` with the aggregates above. All numbers derived from the CSVs — no hand-tuning.

### 2. Rewrite `src/lib/historical-config.ts`
- Re-export from `bbm-finalist-history.ts` instead of holding inline arrays.
- `FINALIST_DRAFT_DISTRIBUTION` becomes the **4-year average** daily weights.
- `EARLIEST_HISTORICAL_FILL_MMDD` becomes the earliest finalist fill across all 4 years.
- `LATEST_COMPLETION_MMDD` becomes the latest finalist fill across all 4 years.
- `FINALIST_MONTH_BREAKDOWN` becomes the 4-year averaged monthly pcts.
- Add new export `FINALIST_HISTORY_BY_YEAR: { year, label, total, monthly: MonthBreakdownEntry[], earliest, latest }[]` for the UI.

### 3. Update `src/lib/analysis.ts`
- `historyBullets` becomes a **combined table-style list**, one bullet per month, comparing all 4 years + average. Format:
  - `August: 47% / 50% / 49% / 50% — avg 49% (BBM II / III / IV / V)`
- `suggestionBullets` keeps the same dynamic logic but cites the 4-year average pct (e.g., "~30% of finalists across BBM II–V were drafted before June 15").
- `details` (the top window-fit bullets) now reference "BBM II–V" instead of "BBM V".

### 4. Update `src/components/scheduler/ScheduleAnalysis.tsx`
- Section title: **"Finalist draft history (BBM II–V, 2021–2024)"**
- Subtitle updates to: `Combined across {total} finalist drafts over 4 BBM seasons, by month of draft_filled_time.`
- Bullet list renders the new combined-row format. No layout change beyond text.

## Out of scope

- Charts / per-year toggles in the UI (you chose the single combined bullet list).
- Re-fetching the sheet at runtime (everything is embedded).
- Backfilling BBM I (not in your sheet).

## Technical notes

- The 4 years have different open dates (NFL Draft moves yearly). The combined daily curve aligns on **calendar month-day** (e.g., July 15 in BBM II maps to July 15 in BBM V), not on "day-since-open." Date pickers and the scheduler already operate in calendar dates, so this matches.
- Earliest/latest pickers will widen vs today's bounds (currently `06-02` → `08-31` from BBM V only). Expect both ends to shift outward once older years are included.
- The pre-aggregation runs once during implementation via a small Node/Python script in `/tmp/`; only the generated `.ts` file ships in the app.
