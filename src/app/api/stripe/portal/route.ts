import { NextResponse } from "next/server";
import { requireUser } from "@/lib/session";
import { supabase } from "@/lib/supabase";
import { stripe, APP_URL } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await requireUser();

    const { data: user } = await supabase
      .from("User")
      .select("stripeCustomerId")
      .eq("id", session.userId)
      .single();

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: "No Stripe customer found" }, { status: 400 });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${APP_URL}/billing`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err) {
    console.error("[stripe/portal]", err);
    return NextResponse.json({ error: "Failed to open billing portal" }, { status: 500 });
  }
}
