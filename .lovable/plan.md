# Wire the Stripe Payment Link to Account Creation

You've created a Stripe Payment Link (`buy.stripe.com/14A14o...`). Since this is a hosted Stripe Payment Link (not a Checkout Session we create from code), the integration shape is different from the original plan — we'll drive everything off a **Stripe webhook** plus a **confirmation page redirect**.

## How It Will Work

1. Visitor clicks **Unlock for $25** on the paywall → opens your Payment Link (`https://buy.stripe.com/14A14o1sI5VRdYf4Mw0oM00`) in a new tab/redirect.
2. Stripe collects their email + payment.
3. **Two things happen on success:**
   - **Stripe → our webhook** at `/api/public/stripe-webhook` fires a `checkout.session.completed` event. We verify the signature, extract `customer_email` + `session.id`, and insert a `paid_access` row (email, stripe_session_id, paid_at, expires_at = Dec 31 of current year).
   - **Stripe → user's browser** redirects to a confirmation URL we configure on the Payment Link: `https://<your-domain>/welcome?session_id={CHECKOUT_SESSION_ID}`.
4. `/welcome` reads the `session_id`, calls a server function `verify-checkout` that looks up the `paid_access` row by `stripe_session_id`. If found → shows "Set your password" form pre-filled with the Stripe email. If not found yet (webhook hasn't landed) → polls every 1s for up to ~10s.
5. User sets password → `auth.signUp({ email, password })` creates the account. A database trigger on `auth.users` allows this signup *only because* a `paid_access` row already exists for that email. The trigger also stamps `paid_access.user_id` so we can query access by user.
6. Returning visit: user signs in at `/login` (email/password or Google). `useAccess()` hook checks `paid_access` for their user_id — if `expires_at > now()`, paywall is removed everywhere.

## What You'll Need to Do (3 quick things)

1. **In your Stripe Payment Link settings** → "After payment" → set **"Don't show confirmation page, redirect to your website"** → URL: `https://<your-lovable-domain>/welcome?session_id={CHECKOUT_SESSION_ID}`. (I'll give you the exact URL after we know your published domain — for testing the preview URL works too.)
2. **In Stripe Dashboard → Developers → Webhooks** → add endpoint pointing to `https://<your-lovable-domain>/api/public/stripe-webhook`, subscribing to `checkout.session.completed`. Copy the signing secret.
3. **Provide two secrets** when I prompt: `STRIPE_SECRET_KEY` (Dashboard → Developers → API keys) and `STRIPE_WEBHOOK_SECRET` (from the webhook you create in step 2).

## What I'll Build

### Backend (Lovable Cloud — already enabled)

- **Migration**: `paid_access` table — `id`, `user_id` (nullable until signup links it), `email` (unique), `stripe_session_id` (unique), `paid_at`, `expires_at`, `created_at`. RLS: users can `SELECT` only rows where `user_id = auth.uid()`.
- **Database trigger** `restrict_signup_to_paid_emails` on `auth.users` BEFORE INSERT: raise exception unless a `paid_access` row exists for `NEW.email`. Also writes `NEW.id` into that row's `user_id`. This is the "no account without payment" gate.
- **Server route** `/api/public/stripe-webhook` (TanStack server route — `/api/public/*` bypasses auth on published sites): verifies Stripe signature with `STRIPE_WEBHOOK_SECRET`, handles `checkout.session.completed`, upserts `paid_access` keyed by `stripe_session_id`.
- **Server function** `verifyCheckout({ sessionId })`: uses service-role client to look up `paid_access` by `stripe_session_id`, returns `{ email, found }`. Client polls this after redirect.
- **Server function** `getMyAccess()` (auth middleware): returns `{ hasAccess, expiresAt }` for the signed-in user.

### Frontend

- **`/welcome` route**: reads `?session_id=`, polls `verifyCheckout`, shows email + "Set password" form, calls `supabase.auth.signUp({ email, password })`, then redirects to `/`. Google sign-in button also available — uses same email or links via `auth.linkIdentity`.
- **`/login` route**: email/password + Google buttons. No sign-up tab (signup is paywall-gated).
- **Header** (in `__root.tsx`): "Sign in" link top-right when logged out; email + sign-out dropdown when logged in.
- **`<PaywallGate>`**: wraps children with blur + pointer-events-none and a centered CTA card *"For the cost of 1 best ball entry, you can have a draft-window-optimized portfolio of 150 teams. Unlock for $25"* → links to your Stripe Payment Link. Skips blur when `useAccess().hasAccess === true`.
- **`ScheduleAnalysis.tsx`**: keep section titles/headlines sharp; wrap the three bullet lists in one `<PaywallGate>` with a single CTA spanning the region.
- **`ScheduleCalendar.tsx`**: render April + May normally; wrap June–September months in a single `<PaywallGate>` region with one CTA.
- **`useAccess()` hook**: queries `getMyAccess` via React Query, caches result.

## Edge Cases I'll Handle

- **Webhook arrives before user finishes signing up** (common): `verify-checkout` poll picks up the row as soon as it's written; signup trigger sees it and allows account creation.
- **User closes tab before signing up**: their `paid_access` row is already created (user_id null). When they return and try to sign up at `/login` → I'll add a "Finish setting up your account" link that asks for the paid email + sends a magic-link sign-up — same trigger gate applies.
- **Google sign-in with a Gmail address that differs from Stripe email**: signup trigger rejects it with a clear message ("Use the email you paid with: ***@***"). User can re-try with the right Google account.
- **Webhook signature failure**: returns 401, Stripe retries automatically.

## What I Cannot Do From Code
- Configuring the Payment Link's confirmation redirect URL — you do this in Stripe Dashboard.
- Creating the webhook endpoint in Stripe — you do this in Stripe Dashboard and paste the signing secret when I prompt.

## Out of Scope (this plan)
- Auto-renewal / subscription billing (still one-time, expires Dec 31).
- Magic-link / passwordless flow (only if you want it later).
- Refunds, coupons, admin dashboard.

Ready to implement? On approval I'll: run the DB migration, ask you for the two Stripe secrets, build the webhook + server functions + paywall UI + auth pages, then walk you through the two Stripe Dashboard config steps.