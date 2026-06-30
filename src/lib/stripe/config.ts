import { isStripeConfigured } from "@/lib/stripe/server";

export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
}

export function isStripeWebhookConfigured(): boolean {
  return isStripeConfigured() && Boolean(process.env.STRIPE_WEBHOOK_SECRET);
}
