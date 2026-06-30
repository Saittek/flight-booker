import { NextResponse } from "next/server";
import { fulfillPendingBooking } from "@/lib/bookings/fulfill";
import {
  getPendingBookingByPaymentIntent,
  updatePendingBooking,
} from "@/lib/bookings/store";
import { getStripe } from "@/lib/stripe/server";
import { isStripeWebhookConfigured } from "@/lib/stripe/config";
import type Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isStripeWebhookConfigured()) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid signature.";
    console.error("[webhooks/stripe] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const pendingBookingId = paymentIntent.metadata?.pendingBookingId;

        if (!pendingBookingId) {
          console.warn(
            "[webhooks/stripe] payment_intent.succeeded without pendingBookingId:",
            paymentIntent.id,
          );
          break;
        }

        const existing = getPendingBookingByPaymentIntent(paymentIntent.id);
        if (existing?.status === "completed") {
          console.info("[webhooks/stripe] Booking already completed:", paymentIntent.id);
          break;
        }

        await fulfillPendingBooking(pendingBookingId, paymentIntent);
        console.info("[webhooks/stripe] Booking fulfilled:", pendingBookingId);
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const pendingBookingId = paymentIntent.metadata?.pendingBookingId;
        if (pendingBookingId) {
          updatePendingBooking(pendingBookingId, {
            status: "failed",
            error:
              paymentIntent.last_payment_error?.message ?? "Payment failed.",
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook handler failed.";
    console.error("[webhooks/stripe]", event.type, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
