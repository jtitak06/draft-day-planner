import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import Stripe from "stripe";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function endOfYearISO() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), 11, 31, 23, 59, 59)).toISOString();
}

/**
 * Verifies a Stripe Checkout Session by ID and grants paid access to the
 * associated email. Idempotent (uses stripe_session_id unique constraint).
 * Returns the email so the client can prefill the signup form.
 */
export const verifyCheckoutAndGrantAccess = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ session_id: z.string().min(8) }).parse(data),
  )
  .handler(async ({ data }) => {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error("Stripe is not configured. Missing STRIPE_SECRET_KEY.");
    }
    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.retrieve(data.session_id);

    if (session.payment_status !== "paid") {
      return {
        ok: false as const,
        reason: "Payment not yet completed.",
      };
    }

    const email =
      session.customer_details?.email ?? session.customer_email ?? null;
    if (!email) {
      return { ok: false as const, reason: "No email on Stripe session." };
    }

    // Upsert paid_access row keyed by stripe_session_id (idempotent)
    const { data: existing } = await supabaseAdmin
      .from("paid_access")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (!existing) {
      const { error } = await supabaseAdmin.from("paid_access").insert({
        email: email.toLowerCase(),
        stripe_session_id: session.id,
        expires_at: endOfYearISO(),
      });
      if (error && !error.message.includes("duplicate")) {
        throw new Error(`Failed to record access: ${error.message}`);
      }
    }

    // Has this email already created an account?
    const { data: row } = await supabaseAdmin
      .from("paid_access")
      .select("user_id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    return {
      ok: true as const,
      email,
      hasAccount: Boolean(row?.user_id),
    };
  });

/**
 * Returns the current signed-in user's paid_access status.
 */
export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("paid_access")
      .select("expires_at")
      .eq("user_id", userId)
      .order("expires_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { hasAccess: false as const, expiresAt: null };
    }
    if (!data) return { hasAccess: false as const, expiresAt: null };

    const expires = new Date(data.expires_at);
    return {
      hasAccess: expires > new Date(),
      expiresAt: data.expires_at,
    };
  });