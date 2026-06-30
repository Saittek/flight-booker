import { bookAmadeusFlight, isAmadeusConfigured } from "@/lib/amadeus/client";
import {
  getPendingBooking,
  updatePendingBooking,
  type BookingResult,
  type PendingBookingRecord,
} from "@/lib/bookings/store";
import { fromStripeAmount, toStripeAmount } from "@/lib/stripe/server";
import type Stripe from "stripe";

export async function fulfillPendingBooking(
  pendingBookingId: string,
  paymentIntent: Stripe.PaymentIntent,
): Promise<BookingResult> {
  const pending = getPendingBooking(pendingBookingId);
  if (!pending) {
    throw new Error(`Pending booking ${pendingBookingId} not found.`);
  }

  if (pending.status === "completed" && pending.result) {
    return pending.result;
  }

  if (pending.status === "failed") {
    throw new Error(pending.error ?? "Booking previously failed.");
  }

  verifyPaymentMatchesPending(paymentIntent, pending);

  updatePendingBooking(pendingBookingId, {
    status: "payment_received",
    paymentIntentId: paymentIntent.id,
  });

  if (!isAmadeusConfigured()) {
    const err = "Amadeus API credentials are not configured.";
    updatePendingBooking(pendingBookingId, { status: "failed", error: err });
    throw new Error(err);
  }

  updatePendingBooking(pendingBookingId, { status: "booking" });

  try {
    const order = await bookAmadeusFlight(pending.pricedOffer, pending.travelers);

    const associatedRecords = (
      order as { associatedRecords?: { reference?: string }[] }
    ).associatedRecords;

    const stripeReceiptUrl =
      paymentIntent.latest_charge && typeof paymentIntent.latest_charge === "object"
        ? (paymentIntent.latest_charge as { receipt_url?: string }).receipt_url
        : undefined;

    const result: BookingResult = {
      orderId: (order as { id?: string }).id ?? `order-${Date.now()}`,
      bookingReference: associatedRecords?.[0]?.reference,
      total: pending.expectedTotal,
      currency: pending.expectedCurrency,
      paymentIntentId: paymentIntent.id,
      stripeReceiptUrl,
    };

    updatePendingBooking(pendingBookingId, { status: "completed", result });
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed.";
    updatePendingBooking(pendingBookingId, { status: "failed", error: message });
    throw err;
  }
}

function verifyPaymentMatchesPending(
  paymentIntent: Stripe.PaymentIntent,
  pending: PendingBookingRecord,
): void {
  if (paymentIntent.status !== "succeeded") {
    throw new Error(`Payment not completed (status: ${paymentIntent.status}).`);
  }

  const expectedCents = toStripeAmount(pending.expectedTotal, pending.expectedCurrency);
  if (paymentIntent.amount !== expectedCents) {
    throw new Error("Payment amount does not match the flight total.");
  }

  if (paymentIntent.currency.toLowerCase() !== pending.expectedCurrency.toLowerCase()) {
    throw new Error("Payment currency does not match.");
  }

  const paidAmount = fromStripeAmount(paymentIntent.amount, paymentIntent.currency);
  const metadataAmount = paymentIntent.metadata?.amount;
  if (metadataAmount && Math.abs(parseFloat(metadataAmount) - paidAmount) > 0.01) {
    throw new Error("Payment metadata amount mismatch.");
  }
}

export async function fulfillFromPaymentIntentId(
  paymentIntentId: string,
): Promise<BookingResult> {
  const { getStripe } = await import("@/lib/stripe/server");
  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

  const pendingBookingId = paymentIntent.metadata?.pendingBookingId;
  if (!pendingBookingId) {
    throw new Error("Payment intent missing pendingBookingId metadata.");
  }

  return fulfillPendingBooking(pendingBookingId, paymentIntent);
}
