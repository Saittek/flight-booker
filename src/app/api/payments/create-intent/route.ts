import { NextResponse } from "next/server";
import { linkPaymentIntent } from "@/lib/bookings/store";
import { getStripePublishableKey, isStripeWebhookConfigured } from "@/lib/stripe/config";
import { getStripe, isStripeConfigured, toStripeAmount } from "@/lib/stripe/server";

export async function GET() {
  return NextResponse.json({
    configured: isStripeConfigured(),
    publishableKey: getStripePublishableKey(),
    webhookConfigured: isStripeWebhookConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    if (!isStripeConfigured()) {
      return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
    }

    const body = (await request.json()) as {
      amount: number;
      currency: string;
      offerId: string;
      pendingBookingId: string;
      email?: string;
      description?: string;
    };

    if (!body.amount || !body.currency || !body.offerId || !body.pendingBookingId) {
      return NextResponse.json(
        { error: "Amount, currency, offerId, and pendingBookingId required." },
        { status: 400 },
      );
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeAmount(body.amount, body.currency),
      currency: body.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      receipt_email: body.email || undefined,
      description: body.description ?? `BagMatch flight ${body.offerId}`,
      metadata: {
        offerId: body.offerId,
        pendingBookingId: body.pendingBookingId,
        amount: String(body.amount),
        currency: body.currency,
      },
    });

    await linkPaymentIntent(body.pendingBookingId, paymentIntent.id);

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Payment setup failed.";
    console.error("[payments/create-intent]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
