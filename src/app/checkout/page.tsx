"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AirlineBaggagePanel } from "@/components/AirlineBaggagePanel";
import { StripePaymentSection } from "@/components/StripePaymentSection";
import { getAirportByCode } from "@/lib/airports";
import { loadSearch, loadSelectedOffer, saveBookingConfirmation } from "@/lib/offer-storage";
import type { BookingResult } from "@/lib/bookings/store";
import type { FlightOffer, SearchCriteria, TravelerForm } from "@/types";
import { CABIN_CLASS_LABELS, formatMoney } from "@/types";

const emptyTraveler = (): TravelerForm => ({
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "MALE",
  email: "",
  countryCallingCode: "1",
  phoneNumber: "",
});

export default function CheckoutPage() {
  const router = useRouter();
  const [offer, setOffer] = useState<FlightOffer | null>(null);
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [travelers, setTravelers] = useState<TravelerForm[]>([]);
  const [pricing, setPricing] = useState(false);
  const [booking, setBooking] = useState(false);
  const [pricedOffer, setPricedOffer] = useState<FlightOffer | null>(null);
  const [rawPricedOffer, setRawPricedOffer] = useState<Record<string, unknown> | null>(null);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    const selected = loadSelectedOffer();
    const search = loadSearch();
    if (!selected || !search) {
      router.replace("/");
      return;
    }
    setOffer(selected);
    setCriteria(search);
    setTravelers(Array.from({ length: search.passengers }, () => emptyTraveler()));

    fetch("/api/payments/create-intent", { method: "GET" })
      .then((r) => r.json())
      .then((d) => setStripeEnabled(Boolean(d.configured)))
      .catch(() => setStripeEnabled(false));
  }, [router]);

  useEffect(() => {
    if (!offer || !criteria || offer.source !== "amadeus" || !offer.amadeusOffer) return;

    async function confirmPrice() {
      setPricing(true);
      setError("");
      try {
        const res = await fetch("/api/flights/price", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ offer: offer!.amadeusOffer, criteria }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Could not confirm price");

        setPricedOffer(data.offer);
        setRawPricedOffer(data.pricedOffer);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Pricing failed.");
        setPricedOffer(offer);
      } finally {
        setPricing(false);
      }
    }

    confirmPrice();
  }, [offer, criteria]);

  const displayOffer = pricedOffer ?? offer;
  if (!displayOffer || !criteria) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Loading checkout…
      </div>
    );
  }

  const pb = displayOffer.priceBreakdown;
  const currency = pb.currency ?? "USD";

  function updateTraveler(index: number, patch: Partial<TravelerForm>) {
    setTravelers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function handlePaymentSuccess(result: BookingResult) {
    saveBookingConfirmation({
      orderId: result.orderId,
      bookingReference: result.bookingReference,
      airline: displayOffer!.airline,
      total: result.total,
      currency: result.currency,
      origin: displayOffer!.origin,
      destination: displayOffer!.destination,
      departTime: displayOffer!.departTime,
      paymentIntentId: result.paymentIntentId,
      stripeReceiptUrl: result.stripeReceiptUrl,
    });
    router.push("/confirmation");
  }

  async function completeBooking() {
    if (!displayOffer || !criteria) return;

    setBooking(true);
    setError("");

    try {
      if (displayOffer.source === "mock") {
        saveBookingConfirmation({
          orderId: `DEMO-${Date.now()}`,
          bookingReference: "BAGMATCH-DEMO",
          airline: displayOffer.airline,
          total: displayOffer.totalPriceUsd,
          currency,
          origin: displayOffer.origin,
          destination: displayOffer.destination,
          departTime: displayOffer.departTime,
          demo: true,
        });
        router.push("/confirmation");
        return;
      }

      if (!rawPricedOffer) {
        throw new Error("Price not confirmed yet.");
      }

      const travelerIds = (
        (rawPricedOffer.travelerPricings as { travelerId?: string }[] | undefined) ?? []
      ).map((tp, i) => tp.travelerId ?? String(i + 1));

      const payload = travelers.map((t, i) => ({
        id: travelerIds[i] ?? String(i + 1),
        firstName: t.firstName,
        lastName: t.lastName,
        dateOfBirth: t.dateOfBirth,
        gender: t.gender,
        email: travelers[0].email,
        countryCallingCode: t.countryCallingCode,
        phoneNumber: t.phoneNumber,
      }));

      const res = await fetch("/api/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricedOffer: rawPricedOffer,
          travelers: payload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Booking failed");

      saveBookingConfirmation({
        orderId: data.orderId,
        bookingReference: data.bookingReference,
        airline: displayOffer.airline,
        total: data.total ?? displayOffer.totalPriceUsd,
        currency: data.currency ?? currency,
        origin: displayOffer.origin,
        destination: displayOffer.destination,
        departTime: displayOffer.departTime,
        paymentIntentId: data.paymentIntentId,
        stripeReceiptUrl: data.stripeReceiptUrl,
      });
      router.push("/confirmation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Booking failed.");
    } finally {
      setBooking(false);
    }
  }

  const useStripe =
    stripeEnabled && displayOffer.source === "amadeus" && displayOffer.totalPriceUsd > 0;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/results" className="text-sm text-sky-400 hover:text-sky-300">
        ← Back to results
      </Link>

      <h1 className="mt-4 text-2xl font-bold text-white">Checkout</h1>

      {pricing && (
        <p className="mt-2 text-sm text-sky-400">
          Confirming live price &amp; baggage catalog with airline…
        </p>
      )}

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-semibold text-white">{displayOffer.airline}</p>
            <p className="text-sm text-slate-400">
              {displayOffer.flightNumber} · {CABIN_CLASS_LABELS[displayOffer.cabinClass]}
            </p>
            <p className="mt-2 text-sm text-slate-300">
              {getAirportByCode(displayOffer.origin)?.city ?? displayOffer.origin} →{" "}
              {getAirportByCode(displayOffer.destination)?.city ?? displayOffer.destination}
            </p>
            <p className="text-sm text-slate-400">
              {displayOffer.departTime} – {displayOffer.arriveTime} · {displayOffer.duration}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">
              {formatMoney(displayOffer.totalPriceUsd, currency)}
            </p>
            <p className="text-xs text-slate-500">total</p>
          </div>
        </div>

        <div className="mt-4 space-y-1 border-t border-slate-800 pt-4 text-sm">
          <div className="flex justify-between text-slate-400">
            <span>Base fare</span>
            <span>{formatMoney(pb.base, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Taxes &amp; airline fees</span>
            <span>{formatMoney(pb.taxes + pb.fees, currency)}</span>
          </div>
          {displayOffer.baggageFeesUsd > 0 && (
            <div className="flex justify-between text-amber-400">
              <span>Est. extra baggage</span>
              <span>{formatMoney(displayOffer.baggageFeesUsd, currency)}</span>
            </div>
          )}
          {displayOffer.seatSelectionFeeUsd > 0 && (
            <div className="flex justify-between text-slate-400">
              <span>Seat selection (est.)</span>
              <span>{formatMoney(displayOffer.seatSelectionFeeUsd, currency)}</span>
            </div>
          )}
        </div>

        <AirlineBaggagePanel offer={displayOffer} />
      </div>

      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-white">Passenger details</h2>

        {travelers.map((t, i) => (
          <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="mb-3 text-sm font-medium text-slate-300">
              Passenger {i + 1}
              {criteria.passengers > 1 ? ` of ${criteria.passengers}` : ""}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">First name</span>
                <input
                  required
                  value={t.firstName}
                  onChange={(e) => updateTraveler(i, { firstName: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Last name</span>
                <input
                  required
                  value={t.lastName}
                  onChange={(e) => updateTraveler(i, { lastName: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Date of birth</span>
                <input
                  required
                  type="date"
                  value={t.dateOfBirth}
                  onChange={(e) => updateTraveler(i, { dateOfBirth: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Gender</span>
                <select
                  value={t.gender}
                  onChange={(e) =>
                    updateTraveler(i, { gender: e.target.value as "MALE" | "FEMALE" })
                  }
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </label>
              {i === 0 && (
                <label className="block sm:col-span-2">
                  <span className="mb-1 block text-xs text-slate-500">Email</span>
                  <input
                    required
                    type="email"
                    value={t.email}
                    onChange={(e) => updateTraveler(i, { email: e.target.value })}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  />
                </label>
              )}
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Country code</span>
                <input
                  required
                  value={t.countryCallingCode}
                  onChange={(e) => updateTraveler(i, { countryCallingCode: e.target.value })}
                  placeholder="1"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs text-slate-500">Phone</span>
                <input
                  required
                  value={t.phoneNumber}
                  onChange={(e) => updateTraveler(i, { phoneNumber: e.target.value })}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                />
              </label>
            </div>
          </div>
        ))}

        <label className="flex items-start gap-3 rounded-xl border border-slate-800 p-4">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-600 text-sky-500"
          />
          <span className="text-sm text-slate-400">
            I understand this fare is subject to the airline&apos;s baggage rules and change
            policies.
            {useStripe
              ? " Payment is verified by Stripe webhook before your flight is ticketed."
              : displayOffer.source === "amadeus"
                ? " Amadeus sandbox booking (no Stripe configured)."
                : " Demo mode — no real ticket."}
          </span>
        </label>

        {error && (
          <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        {useStripe ? (
          <StripePaymentSection
            offer={displayOffer}
            travelers={travelers}
            agreed={agreed}
            rawPricedOffer={rawPricedOffer}
            disabled={pricing || booking}
            onSuccess={handlePaymentSuccess}
            onError={setError}
          />
        ) : (
          <button
            type="button"
            disabled={booking || pricing || !agreed}
            onClick={() => completeBooking()}
            className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {booking
              ? "Booking…"
              : `Purchase — ${formatMoney(displayOffer.totalPriceUsd, currency)}`}
          </button>
        )}
      </div>
    </div>
  );
}
