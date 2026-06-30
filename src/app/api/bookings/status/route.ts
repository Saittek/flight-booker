import { NextResponse } from "next/server";
import {
  getPendingBooking,
  getPendingBookingByPaymentIntent,
} from "@/lib/bookings/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pendingBookingId = searchParams.get("pendingBookingId");
  const paymentIntentId = searchParams.get("paymentIntentId");

  const record =
    (pendingBookingId ? getPendingBooking(pendingBookingId) : null) ??
    (paymentIntentId ? getPendingBookingByPaymentIntent(paymentIntentId) : null);

  if (!record) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  return NextResponse.json({
    id: record.id,
    status: record.status,
    result: record.result ?? null,
    error: record.error ?? null,
    flightSummary: record.flightSummary,
  });
}
