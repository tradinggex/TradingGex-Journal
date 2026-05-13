import "server-only";
import { supabase } from "@/lib/supabase";

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "canceled"
  | "past_due"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | null;

export interface UserSubscription {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodEnd: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

/** Returns true when the user may access the full app. */
export function hasAccess(sub: UserSubscription): boolean {
  const { subscriptionStatus, trialEndsAt, currentPeriodEnd } = sub;

  if (subscriptionStatus === "active") return true;

  if (
    subscriptionStatus === "trialing" &&
    trialEndsAt &&
    new Date(trialEndsAt) > new Date()
  )
    return true;

  // Canceled but the paid period hasn't ended yet
  if (
    subscriptionStatus === "canceled" &&
    currentPeriodEnd &&
    new Date(currentPeriodEnd) > new Date()
  )
    return true;

  return false;
}

/** Returns days remaining in trial (0 if expired / not trialing). */
export function trialDaysLeft(sub: UserSubscription): number {
  if (sub.subscriptionStatus !== "trialing" || !sub.trialEndsAt) return 0;
  const ms = new Date(sub.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

export async function getUserSubscription(
  userId: string
): Promise<UserSubscription> {
  const { data } = await supabase
    .from("User")
    .select(
      "subscriptionStatus, trialEndsAt, currentPeriodEnd, stripeCustomerId, stripeSubscriptionId"
    )
    .eq("id", userId)
    .single();

  return {
    subscriptionStatus: (data?.subscriptionStatus as SubscriptionStatus) ?? "trialing",
    trialEndsAt: data?.trialEndsAt ?? null,
    currentPeriodEnd: data?.currentPeriodEnd ?? null,
    stripeCustomerId: data?.stripeCustomerId ?? null,
    stripeSubscriptionId: data?.stripeSubscriptionId ?? null,
  };
}
