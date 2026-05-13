import "server-only";
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
  typescript: true,
});

export const PRICE_ID = process.env.STRIPE_PRICE_ID!;
export const APP_URL  = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
