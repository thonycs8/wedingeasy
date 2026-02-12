import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: unknown) => {
  console.log(`[STRIPE-WEBHOOK] ${step}${details ? ` - ${JSON.stringify(details)}` : ""}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    // If STRIPE_WEBHOOK_SECRET is set, verify signature
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let event: Stripe.Event;

    if (webhookSecret && sig) {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
      logStep("Webhook signature verified");
    } else {
      event = JSON.parse(body) as Stripe.Event;
      logStep("Webhook processed without signature verification");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    logStep("Processing event", { type: event.type });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.supabase_user_id;
        const weddingId = session.metadata?.wedding_id;

        logStep("Checkout completed", { userId, weddingId, mode: session.mode });

        if (!userId) break;

        // Record payment
        await supabase.from("payment_history").insert({
          user_id: userId,
          wedding_id: weddingId || null,
          stripe_payment_id: session.payment_intent as string || session.subscription as string,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "eur",
          status: "succeeded",
          description: `Checkout ${session.mode}`,
          payment_type: session.mode === "subscription" ? "subscription" : "one_time",
        });

        // Update wedding subscription if applicable
        if (weddingId) {
          const updateData: Record<string, unknown> = {
            stripe_subscription_id: session.subscription as string || null,
            billing_type: session.mode === "subscription" ? "monthly" : "one_time",
            paid_amount: (session.amount_total || 0) / 100,
            payment_date: new Date().toISOString(),
            status: "active",
          };

          await supabase
            .from("wedding_subscriptions")
            .update(updateData)
            .eq("wedding_id", weddingId);
        }

        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        logStep("Invoice paid", { customerId, amount: invoice.amount_paid });

        // Find user by stripe_customer_id
        const { data: profile } = await supabase
          .from("billing_profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          await supabase.from("payment_history").insert({
            user_id: profile.user_id,
            stripe_invoice_id: invoice.id,
            stripe_payment_id: invoice.payment_intent as string,
            amount: invoice.amount_paid / 100,
            currency: invoice.currency,
            status: "succeeded",
            description: `Invoice ${invoice.number || invoice.id}`,
            payment_type: "subscription",
          });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        logStep("Invoice payment failed", { customerId });

        const { data: profile } = await supabase
          .from("billing_profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();

        if (profile) {
          // Mark service subscriptions as past_due
          await supabase
            .from("service_subscriptions")
            .update({ status: "past_due" })
            .eq("user_id", profile.user_id)
            .eq("status", "active");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        logStep("Subscription deleted", { customerId, subscriptionId: subscription.id });

        // Update service_subscriptions
        await supabase
          .from("service_subscriptions")
          .update({ status: "expired" })
          .eq("stripe_subscription_id", subscription.id);

        // Update wedding_subscriptions
        await supabase
          .from("wedding_subscriptions")
          .update({ status: "cancelled" })
          .eq("stripe_subscription_id", subscription.id);

        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
});
