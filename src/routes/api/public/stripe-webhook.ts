import { createFileRoute } from "@tanstack/react-router";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function endOfYearISO() {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59),
  ).toISOString();
}

export const Route = createFileRoute("/api/public/stripe-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const stripeKey = process.env.STRIPE_SECRET_KEY;
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!stripeKey || !webhookSecret) {
          return new Response("Stripe not configured", { status: 500 });
        }

        const signature = request.headers.get("stripe-signature");
        if (!signature) {
          return new Response("Missing stripe-signature", { status: 400 });
        }

        const body = await request.text();
        const stripe = new Stripe(stripeKey);

        let event: Stripe.Event;
        try {
          // constructEventAsync uses Web Crypto (works on Cloudflare Workers)
          event = await stripe.webhooks.constructEventAsync(
            body,
            signature,
            webhookSecret,
          );
        } catch (err) {
          const message = err instanceof Error ? err.message : "bad signature";
          return new Response(`Signature verification failed: ${message}`, {
            status: 400,
          });
        }

        if (event.type !== "checkout.session.completed") {
          // Acknowledge other events so Stripe doesn't retry
          return new Response("ignored", { status: 200 });
        }

        const session = event.data.object as Stripe.Checkout.Session;

        if (session.payment_status !== "paid") {
          return new Response("not paid", { status: 200 });
        }

        const email =
          session.customer_details?.email ?? session.customer_email ?? null;
        if (!email) {
          console.error("[stripe-webhook] No email on session", session.id);
          return new Response("no email on session", { status: 200 });
        }

        const lowerEmail = email.toLowerCase();

        // 1. Insert paid_access row (idempotent on stripe_session_id)
        const { data: existing } = await supabaseAdmin
          .from("paid_access")
          .select("id")
          .eq("stripe_session_id", session.id)
          .maybeSingle();

        if (!existing) {
          const { error: insertError } = await supabaseAdmin
            .from("paid_access")
            .insert({
              email: lowerEmail,
              stripe_session_id: session.id,
              expires_at: endOfYearISO(),
            });
          if (insertError && !insertError.message.includes("duplicate")) {
            console.error(
              "[stripe-webhook] paid_access insert failed",
              insertError.message,
            );
            // Return 500 so Stripe retries
            return new Response("db error", { status: 500 });
          }
        }

        // 2. Send invite email so the buyer can set a password.
        //    Safe to call even if user already exists — we swallow that error.
        const origin = new URL(request.url).origin;
        const { error: inviteError } =
          await supabaseAdmin.auth.admin.inviteUserByEmail(lowerEmail, {
            redirectTo: `${origin}/welcome`,
          });

        if (inviteError) {
          const msg = inviteError.message.toLowerCase();
          const alreadyExists =
            msg.includes("already") ||
            msg.includes("registered") ||
            msg.includes("exists");
          if (!alreadyExists) {
            console.error(
              "[stripe-webhook] invite failed",
              inviteError.message,
            );
            // Don't fail the webhook — paid_access is already recorded.
            // The user can still claim via /welcome redirect.
          }
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});