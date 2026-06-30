import { NextResponse } from "next/server";
import {
  bookAmadeusFlight,
  isAmadeusConfigured,
  type AmadeusRawOffer,
  type TravelerInput,
} from "@/lib/amadeus/client";
import { fulfillFromPaymentIntentId } from "@/lib/bookings/fulfill";
import { getPendingBookingByPaymentIntent, type BookingResult } from "@/lib/bookings/store";
import { isStripeConfigured, verifyPaymentIntent } from "@/lib/stripe/server";
import { isStripeWebhookConfigured } from "@/lib/stripe/config";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      paymentIntentId?: string;
      expectedTotal?: number;
      expectedCurrency?: string;
      pricedOffer?: AmadeusRawOffer;
      travelers?: TravelerInput[];
    };

    if (body.paymentIntentId) {
      const existing = getPendingBookingByPaymentIntent(body.paymentIntentId);
      if (existing?.status === "completed" && existing.result) {
        return NextResponse.json(existing.result);
      }

      if (!isStripeConfigured()) {
        return NextResponse.json({ error: "Stripe is not configured." }, { status: 503 });
      }

      if (body.expectedTotal && body.expectedCurrency) {
        await verifyPaymentIntent(
          body.paymentIntentId,
          body.expectedTotal,
          body.expectedCurrency,
        );
      }

      if (isStripeWebhookConfigured()) {
        return NextResponse.json(
          {
            error:
              "Booking is processed via Stripe webhook. Poll /api/bookings/status.",
            status: existing?.status ?? "pending",
            webhookMode: true,
          },
          { status: 409 },
        );
      }

      const result = await fulfillFromPaymentIntentId(body.paymentIntentId);
      return NextResponse.json(result);
    }

    if (body.pricedOffer && body.travelers?.length) {
      if (!isAmadeusConfigured()) {
        return NextResponse.json(
          { error: "Live booking requires Amadeus API credentials." },
          { status: 503 },
        );
      }

      const order = await bookAmadeusFlight(body.pricedOffer, body.travelers);
      const associatedRecords = (
        order as { associatedRecords?: { reference?: string }[] }
      ).associatedRecords;
      const price = (body.pricedOffer.price ?? {}) as {
        grandTotal?: string;
        total?: string;
        currency?: string;
      };

      const result: BookingResult = {
        orderId: (order as { id?: string }).id ?? `order-${Date.now()}`,
        bookingReference: associatedRecords?.[0]?.reference,
        total: parseFloat(price.grandTotal ?? price.total ?? "0"),
        currency: price.currency ?? "USD",
      };

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid booking request." }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Booking failed.";
    console.error("[flights/book]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
