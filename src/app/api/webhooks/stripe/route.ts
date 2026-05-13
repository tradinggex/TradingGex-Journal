import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export const config = { api: { bodyParser: false } };

async function updateUserSubscription(
  customerId: string,
  patch: Record<string, unknown>
) {
  await supabase
    .from("User")
    .update({ ...patch, updatedAt: new Date().toISOString() })
    .eq("stripeCustomerId", customerId);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription") break;

        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string;
        const userId = session.metadata?.userId as string | undefined;

        // Fetch full subscription to get period end
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        const patch: Record<string, unknown> = {
          stripeSubscriptionId: subscriptionId,
          stripeCustomerId: customerId,
          subscriptionStatus: sub.status,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        };

        if (userId) {
          await supabase
            .from("User")
            .update({ ...patch, updatedAt: new Date().toISOString() })
            .eq("id", userId);
        } else {
          await updateUserSubscription(customerId, patch);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        await updateUserSubscription(sub.customer as string, {
          stripeSubscriptionId: sub.id,
          subscriptionStatus: sub.status,
          currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
        });
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await updateUserSubscription(sub.customer as string, {
          subscriptionStatus: "canceled",
          stripeSubscriptionId: null,
          currentPeriodEnd: sub.canceled_at
            ? new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString()
            : null,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice & { customer: string };
        await updateUserSubscription(invoice.customer, {
          subscriptionStatus: "past_due",
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
        if (invoice.subscription) {
          const sub = await stripe.subscriptions.retrieve(invoice.subscription);
          await updateUserSubscription(invoice.customer as string, {
            subscriptionStatus: sub.status,
            currentPeriodEnd: new Date((sub as unknown as { current_period_end: number }).current_period_end * 1000).toISOString(),
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error("[webhook] handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
