# Monetize the BBM Scheduler

Turn the app into a paid tool: free visitors can use the form and see a blurred preview of results; a one-time $25 payment unlocks full results through December 31 of the current year. Accounts can only be created after payment.

## User Flow

1. Visitor lands on `/` — form is fully usable, "Sign in" button in top-right.
2. They click **Generate schedule** → results render, but bullet lists and June–September calendar months are blurred with a CTA overlay: *"For the cost of 1 best ball entry, you can have a draft-window-optimized portfolio of 150 teams. Unlock full results — $25."*
3. CTA → Stripe Checkout ($25, one-time). Email is collected by Stripe.
4. On payment success → user lands on `/welcome?session_id=...` → sets a password (or links Google) → account created, marked paid through Dec 31.
5. Returning paid users sign in (email/password or Google) and see everything unblurred until their access expires.

## What Gets Built

### 1. Backend (Lovable Cloud)
- Enable Lovable Cloud (Supabase under the hood) for auth + database + edge functions.
- New table `paid_access`: `user_id`, `email`, `stripe_session_id`, `paid_at`, `expires_at` (Dec 31 of paid_at's year), `status`. RLS: user can read their own row only.
- Auth: email/password + Google sign-in enabled.
- **Signup is gated**: a database trigger / edge function rejects sign-up attempts whose email has no matching `paid_access` row with a valid `stripe_session_id`. No open self-serve registration.

### 2. Stripe (built-in Lovable Payments — Stripe)
- Enable Lovable's seamless Stripe integration (no API keys needed, sandbox mode immediately, claim account later to go live).
- Create one product: **BBM Draft Scheduler — Season Pass**, one-time $25.
- Edge function `create-checkout`: creates a Stripe Checkout Session for the $25 product, success URL → `/welcome?session_id={CHECKOUT_SESSION_ID}`.
- Edge function `verify-checkout` (called from `/welcome`): looks up the session, confirms `payment_status === "paid"`, inserts a `paid_access` row keyed by email with `expires_at = Dec 31 of current year`.
- Edge function `check-access` (called on login): returns `{ hasAccess: boolean, expiresAt }` for current user.

### 3. Frontend changes
- **Top-right auth widget** in `src/routes/__root.tsx` (or a header component): "Sign in" when logged out, email + "Sign out" when logged in. Uses shadcn `DropdownMenu`.
- **New routes**:
  - `/login` — email/password + Google buttons. Sign-up tab is hidden; sign-up only reachable post-payment.
  - `/welcome` — post-checkout account creation: takes `session_id`, calls `verify-checkout`, then shows "Set a password" form (or Google link button) pre-filled with the Stripe email.
- **Paywall on `/`**:
  - Form (`SchedulerForm`) — always interactive.
  - On submit, results render as today, but wrapped in a `<PaywallGate>` component for non-paying users.
  - `PaywallGate` renders children with `filter: blur(8px)` + `pointer-events-none`, overlays a centered card with the marketing copy and a **"Unlock for $25"** button → calls `create-checkout` → redirects to Stripe.
  - Applied to: the bullet lists inside `ScheduleAnalysis` (Optimal Strategy details, Finalist Draft History, Suggestions). Headlines/section titles stay sharp.
  - Applied to: calendar months **after May** in `ScheduleCalendar` (April + May render normally; June–September are each wrapped in the gate, but a single overlay button is shown for the whole blurred region).
- **Access detection**: a `useAccess()` hook reads `paid_access` for the signed-in user; `PaywallGate` skips blur when `hasAccess === true`.

## Technical Details

- `ScheduleCalendar.tsx` already renders months in a grid loop. We split the months array into `[unlocked = first 2 months in range that are April/May, locked = rest]` and wrap the locked set in one relative container + overlay so a single CTA covers all blurred months.
- `ScheduleAnalysis.tsx` keeps headlines outside the gate; each `<ul>` is wrapped in `<PaywallGate>`. A single overlay spans all three blurred lists so the CTA only appears once.
- Stripe session email becomes the canonical account email — `/welcome` enforces that the password/Google account is created with that same email so `paid_access.email` matches `auth.users.email`.
- Sign-up gate implemented as a Postgres trigger on `auth.users` insert: raise an exception unless a `paid_access` row exists for the new user's email with a non-null `stripe_session_id`. This blocks the Supabase signup UI and any direct API calls.
- Expiration: server-side check in `check-access` compares `now()` to `expires_at`; client never decides access on its own.

## Out of Scope (this plan)
- Subscription renewals / auto-renew (it's a one-time charge each year; users repurchase after Dec 31).
- Admin dashboard, refunds UI, coupon codes.
- Going live on Stripe — sandbox works immediately; switching to live mode is a one-click claim later.

## What I'll Need From You During Build
- Confirmation to enable **Lovable Cloud** (one click).
- Confirmation to enable **Lovable Payments (Stripe)** (one click; no API keys needed).
- Product name/description for the Stripe product (I'll suggest one; you can tweak).