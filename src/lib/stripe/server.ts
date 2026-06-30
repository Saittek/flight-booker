import Stripe from "stripe";

let stripe: Stripe | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
}

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      httpClient: Stripe.createFetchHttpClient(),
    });
  }
  return stripe;
}

/** Convert a decimal amount to Stripe's smallest currency unit (e.g. cents). */
export function toStripeAmount(amount: number, currency: string): number {
  const zeroDecimal = ["jpy", "krw", "vnd"].includes(currency.toLowerCase());
  return zeroDecimal ? Math.round(amount) : Math.round(amount * 100);
}

export function fromStripeAmount(amount: number, currency: string): number {
  const zeroDecimal = ["jpy", "krw", "vnd"].includes(currency.toLowerCase());
  return zeroDecimal ? amount : amount / 100;
}

export async function verifyPaymentIntent(
  paymentIntentId: string,
  expectedAmount: number,
  expectedCurrency: string,
): Promise<Stripe.PaymentIntent> {
  const stripeClient = getStripe();
  const pi = await stripeClient.paymentIntents.retrieve(paymentIntentId);

  if (pi.status !== "succeeded") {
    throw new Error(`Payment not completed (status: ${pi.status}).`);
  }

  const expectedCents = toStripeAmount(expectedAmount, expectedCurrency);
  if (pi.amount !== expectedCents) {
    throw new Error("Payment amount does not match the flight total.");
  }

  if (pi.currency.toLowerCase() !== expectedCurrency.toLowerCase()) {
    throw new Error("Payment currency does not match.");
  }

  return pi;
}
