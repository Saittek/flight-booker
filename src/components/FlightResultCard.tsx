"use client";

import { useRouter } from "next/navigation";
import { AirlineBaggagePanel } from "@/components/AirlineBaggagePanel";
import type { FlightOffer } from "@/types";
import { CABIN_CLASS_LABELS, formatMoney } from "@/types";
import { saveSelectedOffer } from "@/lib/offer-storage";

const STATUS_STYLES = {
  allowed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  fee: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  not_allowed: "bg-red-500/15 text-red-400 border-red-500/30",
};

const STATUS_LABELS = {
  allowed: "Allowed",
  fee: "Extra fee",
  not_allowed: "Not allowed",
};

interface FlightResultCardProps {
  offer: FlightOffer;
}

export function FlightResultCard({ offer }: FlightResultCardProps) {
  const router = useRouter();
  const pb = offer.priceBreakdown;
  const currency = pb.currency ?? "USD";

  const scoreColor =
    offer.compatibilityScore >= 80
      ? "text-emerald-400"
      : offer.compatibilityScore >= 50
        ? "text-amber-400"
        : "text-red-400";

  function handleSelect() {
    saveSelectedOffer(offer);
    router.push("/checkout");
  }

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 transition hover:border-slate-700 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold text-white">{offer.airline}</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
              {offer.flightNumber}
            </span>
            <span className="rounded-full bg-sky-500/15 px-2.5 py-0.5 text-xs font-medium text-sky-400">
              {CABIN_CLASS_LABELS[offer.cabinClass]}
            </span>
            {offer.source === "amadeus" && (
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-400">
                Live fare
              </span>
            )}
            {offer.stops === 0 ? (
              <span className="text-xs text-emerald-400">Nonstop</span>
            ) : (
              <span className="text-xs text-amber-400">
                {offer.stops} stop{offer.stops > 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div>
              <p className="text-2xl font-bold text-white">{offer.departTime}</p>
              <p className="text-sm text-slate-400">{offer.origin}</p>
            </div>
            <div className="flex flex-1 flex-col items-center px-2">
              <span className="text-xs text-slate-500">{offer.duration}</span>
              <div className="my-1 flex w-full items-center gap-1">
                <div className="h-px flex-1 bg-slate-700" />
                <span className="text-slate-600">✈</span>
                <div className="h-px flex-1 bg-slate-700" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{offer.arriveTime}</p>
              <p className="text-sm text-slate-400">{offer.destination}</p>
            </div>
          </div>

          {offer.returnItinerary && (
            <p className="mt-2 text-xs text-slate-500">
              Return: {offer.returnItinerary.departTime} → {offer.returnItinerary.arriveTime} (
              {offer.returnItinerary.duration})
            </p>
          )}
        </div>

        <div className="shrink-0 text-right sm:min-w-[160px]">
          <p className="text-3xl font-bold text-white">
            {formatMoney(offer.totalPriceUsd, currency)}
          </p>
          <p className="text-xs text-slate-500">
            incl. taxes {formatMoney(pb.taxes, currency)}
          </p>
          {offer.baggageFeesUsd > 0 && (
            <p className="mt-1 text-xs text-amber-400">
              +{formatMoney(offer.baggageFeesUsd, currency)} est. bag fees
            </p>
          )}
          <p className={`mt-2 text-sm font-medium ${scoreColor}`}>
            {offer.compatibilityScore}% match
          </p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Baggage compatibility
        </p>
        <div className="flex flex-wrap gap-2">
          {offer.baggageChecks.map((check) => (
            <span
              key={check.item}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs ${STATUS_STYLES[check.status]}`}
              title={check.message}
            >
              <span className="font-medium">{check.item}</span>
              <span>·</span>
              <span>{STATUS_LABELS[check.status]}</span>
              {check.feeUsd ? <span>(+{formatMoney(check.feeUsd, currency)})</span> : null}
            </span>
          ))}
        </div>
      </div>

      {offer.seatMatch.notes.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">Seats</p>
          <ul className="space-y-0.5">
            {offer.seatMatch.notes.map((note, i) => (
              <li key={i} className="text-xs text-slate-400">
                {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <AirlineBaggagePanel offer={offer} />

      <div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4">
        <div className="text-xs text-slate-500">
          Base {formatMoney(pb.base, currency)} · Taxes {formatMoney(pb.taxes, currency)}
          {offer.seatSelectionFeeUsd > 0 &&
            ` · Seats +${formatMoney(offer.seatSelectionFeeUsd, currency)}`}
        </div>
        <button
          type="button"
          onClick={handleSelect}
          className="rounded-xl bg-white px-5 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100"
        >
          Select flight
        </button>
      </div>
    </article>
  );
}
