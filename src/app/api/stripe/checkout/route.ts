import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { stripe, PRICE_ID, APP_URL } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await requireUser();

    // Fetch or create Stripe customer
    const { data: user } = await supabase
      .from("User")
      .select("stripeCustomerId, email, name")
      .eq("id", session.userId)
      .single();

    let customerId = user?.stripeCustomerId as string | undefined;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user?.email ?? session.email,
        name: user?.name ?? session.name ?? undefined,
        metadata: { userId: session.userId },
      });
      customerId = customer.id;

      await supabase
        .from("User")
        .update({ stripeCustomerId: customerId, updatedAt: new Date().toISOString() })
        .eq("id", session.userId);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ["card"],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      mode: "subscription",
      success_url: `${APP_URL}/?subscribed=1`,
      cancel_url: `${APP_URL}/billing`,
      metadata: { userId: session.userId },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("[stripe/checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
