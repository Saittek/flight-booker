"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAirportByCode } from "@/lib/airports";
import { loadBookingConfirmation } from "@/lib/offer-storage";
import type { BookingConfirmation } from "@/types";
import { formatMoney } from "@/types";

export default function ConfirmationPage() {
  const [booking, setBooking] = useState<
    (BookingConfirmation & { demo?: boolean; stripeReceiptUrl?: string }) | null
  >(null);

  useEffect(() => {
    setBooking(loadBookingConfirmation());
  }, []);

  if (booking === null) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }

  if (!booking.orderId) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-slate-400">No booking found.</p>
        <Link href="/" className="mt-4 inline-block text-sky-400">
          Start a new search
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-3xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-white">
        {booking.demo ? "Demo booking complete" : "Booking confirmed"}
      </h1>
      <p className="mt-2 text-slate-400">
        {booking.demo
          ? "This was a demo — add API keys for live bookings."
          : booking.paymentIntentId
            ? "Payment received and flight booked."
            : "Your flight has been booked through Amadeus."}
      </p>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-6 text-left">
        {booking.bookingReference && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Confirmation code</p>
            <p className="text-2xl font-bold tracking-wider text-sky-400">
              {booking.bookingReference}
            </p>
          </div>
        )}
        <div className="space-y-2 text-sm">
          <p className="text-white">
            {booking.airline}: {getAirportByCode(booking.origin)?.city ?? booking.origin} →{" "}
            {getAirportByCode(booking.destination)?.city ?? booking.destination}
          </p>
          <p className="text-slate-400">Departs {booking.departTime}</p>
          <p className="text-slate-400">
            Total paid: {formatMoney(booking.total, booking.currency)}
          </p>
          {booking.paymentIntentId && (
            <p className="text-xs text-slate-500">Payment ID: {booking.paymentIntentId}</p>
          )}
          {booking.stripeReceiptUrl && (
            <a
              href={booking.stripeReceiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-sky-400 hover:text-sky-300"
            >
              View Stripe receipt →
            </a>
          )}
          <p className="text-xs text-slate-500">Order ID: {booking.orderId}</p>
        </div>
      </div>

      <Link
        href="/"
        className="mt-8 inline-block rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white"
      >
        Book another flight
      </Link>
    </div>
  );
}
