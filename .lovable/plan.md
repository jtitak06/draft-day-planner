
# Best Ball Mania Draft Scheduler — v1 Framework

A free single-page tool that takes a user's total entry count and projected tournament-fill date, then outputs a calendar of when to draft each entry, weighted by the historical distribution of when prior BBM finalist teams were drafted.

## User flow

1. User lands on `/` and sees the scheduler.
2. App auto-detects current BBM cycle (start date = Monday after NFL Draft).
3. User enters:
   - Total number of entries they plan to draft
   - Projected tournament fill date (constrained: min = earliest historical BBM fill date, max = NFL Week 1 kickoff date)
4. App generates a draft schedule — number of drafts per day/week — weighted by historical finalist draft-date distribution.
5. User sees results as a calendar view + summary table, with CSV export.

## Pages / routes

- `src/routes/index.tsx` — the entire tool (form + calendar + table). No other routes in v1.

## Components (`src/components/scheduler/`)

- `SchedulerForm.tsx` — entry count input, fill-date picker (with min/max enforced), submit
- `ScheduleCalendar.tsx` — month grid showing draft counts per day (uses shadcn Calendar styled as heatmap)
- `ScheduleTable.tsx` — week-by-week breakdown: dates, # drafts, % of total, cumulative
- `BbmStatusBanner.tsx` — shows live BBM status pulled from Underdog (open/closed, fills so far)
- `ExportCsvButton.tsx`

## Data layer

### Live Underdog data (server-side only)

Server functions in `src/lib/underdog.functions.ts` (helpers in `underdog.server.ts`):
- `getCurrentBbmTournament()` — fetches current Best Ball Mania tournament metadata (start date, current entrants, tournament id) from Underdog's public draft-pool / tournament endpoints.
- Cached for ~5 minutes via response headers.
- Endpoints discovered from the reference tool's network traffic (e.g. `https://api.underdogfantasy.com/v1/...`). Wrapped with `try/catch` returning a typed `{ data, error }` shape so UI degrades gracefully if Underdog changes their API.

### Static historical config

`src/lib/historical-config.ts` — hand-coded constants the user can later tweak:
- `BBM_HISTORICAL_FILL_DATES` — earliest fill date across past BBMs → used as min for the date picker
- `NFL_SEASON_OPENERS` — Week 1 kickoff per year → used as max for the date picker
- `FINALIST_DRAFT_DISTRIBUTION` — weekly weights (0..1) representing % of finalist teams drafted each week of the cycle, normalized to sum to 1

### Schedule computation

`src/lib/schedule.ts`:
- `computeSchedule({ startDate, endDate, totalEntries, weights })`
  1. Split [startDate, endDate] into N weekly buckets
  2. Map historical weights onto buckets (rescale if window is shorter/longer than historical reference window)
  3. Allocate entries per bucket = `round(totalEntries * normalizedWeight)`, fix rounding drift on the largest bucket
  4. Within each weekly bucket, distribute drafts across days (default: even, with slight evening/weekend bias — toggleable later)
  5. Return `{ days: [{ date, count }], weeks: [{ weekStart, count, pct }] }`

Pure function, fully unit-testable, no network calls.

## Constraints on the date picker

- `min = max(today, BBM_OPEN_DATE)` actually no — earliest selectable end date is `min(BBM_HISTORICAL_FILL_DATES)` (earliest day BBM has ever filled in any prior year, projected onto current cycle)
- `max = NFL Week 1 kickoff for current year`
- Disabled outside this range using shadcn Calendar's `disabled` prop

## Out of scope for v1 (noted for later)

- Saving schedules per user (no auth, no DB)
- Multiple strategies (even / front-loaded / back-loaded)
- Auto-syncing with the user's actual Underdog draft history
- Notifications / reminders

## Technical notes

- Stack: TanStack Start (existing), TypeScript strict, Tailwind v4 + shadcn (already installed)
- New deps: `date-fns` (likely already pulled by shadcn calendar), none else required
- Underdog calls run only in `createServerFn` handlers — never from the browser — to avoid CORS and to allow caching
- All colors via existing semantic tokens in `src/styles.css`; no hard-coded hex
- SEO: route `head()` with title "Best Ball Mania Draft Scheduler" and meta description

## Open items I'll need from you during build

- Confirmation of the historical finalist weekly weights (I'll seed reasonable defaults from public BBM finals data; you can edit `historical-config.ts`)
- Confirmation that scraping Underdog's public endpoints server-side is acceptable for your use case
