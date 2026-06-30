"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TripStep } from "@/components/steps/TripStep";
import { BaggageStep } from "@/components/steps/BaggageStep";
import { SeatStep } from "@/components/steps/SeatStep";
import { buildDefaultSearch } from "@/lib/defaults";
import { saveSearch } from "@/lib/offer-storage";
import type { SearchCriteria } from "@/types";

const STEPS = [
  { id: "trip", label: "Trip" },
  { id: "baggage", label: "Luggage" },
  { id: "seat", label: "Seat" },
] as const;

export function SearchWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [criteria, setCriteria] = useState<SearchCriteria>(buildDefaultSearch);
  const [error, setError] = useState("");

  const updateTrip = (trip: SearchCriteria) => setCriteria((c) => ({ ...c, ...trip }));
  const updateBaggage = (baggage: SearchCriteria["baggage"]) =>
    setCriteria((c) => ({ ...c, baggage }));
  const updateSeat = (seat: SearchCriteria["seat"]) => setCriteria((c) => ({ ...c, seat }));

  function validate(): boolean {
    if (!criteria.origin.trim() || !criteria.destination.trim()) {
      setError("Enter both origin and destination airports.");
      return false;
    }
    if (criteria.origin === criteria.destination) {
      setError("Origin and destination must be different.");
      return false;
    }
    if (!criteria.departDate) {
      setError("Select a departure date.");
      return false;
    }
    setError("");
    return true;
  }

  function next() {
    if (step === 0 && !validate()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      saveSearch(criteria);
      router.push("/results");
    }
  }

  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                i <= step ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-500"
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`hidden text-sm sm:block ${i <= step ? "text-white" : "text-slate-500"}`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${i < step ? "bg-sky-500" : "bg-slate-800"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl backdrop-blur sm:p-8">
        {step === 0 && (
          <TripStep
            value={criteria}
            onChange={(trip) =>
              updateTrip({
                ...criteria,
                ...trip,
              })
            }
          />
        )}
        {step === 1 && <BaggageStep value={criteria.baggage} onChange={updateBaggage} />}
        {step === 2 && <SeatStep value={criteria.seat} onChange={updateSeat} />}

        {error && (
          <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
        )}

        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={back}
            disabled={step === 0}
            className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white disabled:invisible"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            className="rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400"
          >
            {step === STEPS.length - 1 ? "Search flights" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
