## Goal
When a Stripe Checkout completes, automatically grant access **and** email the buyer a link to set their password — even if they close the tab and never see `/welcome`.

## How it works

```text
Stripe Checkout paid
        │
        ▼
checkout.session.completed  ──►  POST /api/public/stripe-webhook
                                          │
                                          │ 1. Verify Stripe signature (STRIPE_WEBHOOK_SECRET)
                                          │ 2. Extract email + session.id
                                          │ 3. Insert paid_access row (idempotent on stripe_session_id)
                                          │ 4. Call supabaseAdmin.auth.admin.inviteUserByEmail(email)
                                          │      → Supabase emails the user a "set your password" link
                                          ▼
                                    Returns 200 OK
```

The existing `/welcome` flow stays as a fallback for users who *do* land there — it becomes a "your account is ready, sign in" screen if the webhook already provisioned them.

## Implementation steps

1. **Request `STRIPE_WEBHOOK_SECRET`** via the secrets tool.

2. **Create `src/routes/api/public/stripe-webhook.ts`** — a TanStack server route:
   - Read raw body with `request.text()` (signature verification needs the exact bytes).
   - Verify signature using `stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)`.
   - On `checkout.session.completed` with `payment_status === "paid"`:
     - Extract `customer_details.email` (or `customer_email`).
     - Upsert into `paid_access` keyed on `stripe_session_id` (idempotent — Stripe retries).
     - Call `supabaseAdmin.auth.admin.inviteUserByEmail(email, { redirectTo: "{origin}/welcome" })`. This sends the standard Supabase invite email containing a link the user clicks to set their password and sign in.
     - If invite returns "user already registered", silently ignore — they already have an account; the new `paid_access` row extends/refreshes their access.
   - Return `200` for all handled events; `200` (not 4xx) for ignored event types so Stripe doesn't retry.
   - Return `400` only on signature-verification failure.

3. **Adjust `handle_new_user_paid_gate` ordering**: the webhook inserts `paid_access` *before* calling `inviteUserByEmail`, so the existing trigger keeps working — when the invited user accepts and the auth row is created, the trigger finds the paid_access row and links `user_id`.

4. **Update `/welcome`** copy to handle the "account already exists" case more gracefully (it already does, but tweak wording to: "We've emailed you a link to set your password — check your inbox.").

5. **Tell the user the webhook URL** to configure in Stripe:
   - Endpoint: `https://project--18a1a34e-c862-466c-b443-d2c91ad3188c.lovable.app/api/public/stripe-webhook`
   - Event to send: `checkout.session.completed`
   - Then copy the **Signing secret** (starts with `whsec_…`) and paste it into the secret prompt.

## Notes / edge cases

- **Idempotency**: Stripe retries webhooks. The `stripe_session_id` unique check on `paid_access` makes the insert safe to repeat. `inviteUserByEmail` is also safe — it returns an error for already-registered users which we swallow.
- **Email delivery**: invite emails go through Supabase's default email sender. Deliverability is fine for testing; if you want branded emails from your own domain later, we can wire up Lovable's email infrastructure as a follow-up.
- **`/welcome` redirect still works**: nothing breaks for users who *do* land there after payment — they'll just see "account ready, sign in" because the webhook already ran.
- **No Stripe API call to retrieve session needed in the webhook** — the event payload already contains everything we need.
