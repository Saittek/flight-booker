"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FlightResultCard } from "@/components/FlightResultCard";
import { getAirportByCode } from "@/lib/airports";
import { loadSearch, saveOffers } from "@/lib/offer-storage";
import type { FlightOffer, SearchCriteria } from "@/types";
import { CABIN_CLASS_LABELS } from "@/types";

type SortMode = "match" | "price";

export default function ResultsPage() {
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [offers, setOffers] = useState<FlightOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataSource, setDataSource] = useState<"amadeus" | "mock" | "">("");
  const [notice, setNotice] = useState("");
  const [sort, setSort] = useState<SortMode>("match");
  const [filterCompatible, setFilterCompatible] = useState(false);

  useEffect(() => {
    const stored = loadSearch();
    setCriteria(stored);

    if (!stored?.origin) {
      setLoading(false);
      return;
    }

    async function fetchFlights() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/flights/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stored),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Search failed");

        setOffers(data.offers ?? []);
        setDataSource(data.source ?? "mock");
        setNotice(data.message ?? "");
        saveOffers(data.offers ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load flights.");
      } finally {
        setLoading(false);
      }
    }

    fetchFlights();
  }, []);

  const sorted = useMemo(() => {
    let list = [...offers];
    if (filterCompatible) {
      list = list.filter(
        (o) =>
          o.compatibilityScore >= 70 &&
          !o.baggageChecks.some((c) => c.status === "not_allowed"),
      );
    }
    if (sort === "price") list.sort((a, b) => a.totalPriceUsd - b.totalPriceUsd);
    else list.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
    return list;
  }, [offers, sort, filterCompatible]);

  if (criteria === null || loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
        <p>Searching live flights…</p>
      </div>
    );
  }

  if (!criteria.origin) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-slate-400">No search found. Start a new search.</p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Search flights
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <Link href="/" className="text-sm text-sky-400 hover:text-sky-300">
          ← New search
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-white">
          {getAirportByCode(criteria.origin)?.city ?? criteria.origin} ({criteria.origin}) →{" "}
          {getAirportByCode(criteria.destination)?.city ?? criteria.destination} (
          {criteria.destination})
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {criteria.departDate}
          {criteria.tripType === "round_trip" && criteria.returnDate
            ? ` – ${criteria.returnDate}`
            : ""}
          {" · "}
          {criteria.passengers} passenger{criteria.passengers > 1 ? "s" : ""}
          {" · "}
          {CABIN_CLASS_LABELS[criteria.seat.cabinClass]}
        </p>
        {dataSource === "amadeus" && (
          <p className="mt-2 text-xs text-emerald-400">
            Live fares from Amadeus · prices include taxes &amp; fees from the airline
          </p>
        )}
        {notice && <p className="mt-2 text-xs text-amber-400">{notice}</p>}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="text-sm text-slate-400">Sort:</span>
        {(
          [
            ["match", "Best match"],
            ["price", "Lowest price"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setSort(key)}
            className={`rounded-full px-3 py-1.5 text-sm ${
              sort === key ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-300"
            }`}
          >
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={filterCompatible}
            onChange={(e) => setFilterCompatible(e.target.checked)}
            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500"
          />
          Bags fully compatible only
        </label>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        {sorted.length} flight{sorted.length !== 1 ? "s" : ""} found
      </p>

      <div className="space-y-4">
        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-12 text-center">
            <p className="text-slate-400">
              {error ? "Try a different route or date." : "No flights match your filters."}
            </p>
            {!error && (
              <button
                type="button"
                onClick={() => setFilterCompatible(false)}
                className="mt-3 text-sm text-sky-400 hover:text-sky-300"
              >
                Show all results
              </button>
            )}
          </div>
        ) : (
          sorted.map((offer) => <FlightResultCard key={offer.id} offer={offer} />)
        )}
      </div>
    </div>
  );
}
