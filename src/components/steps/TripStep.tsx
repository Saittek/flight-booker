"use client";

import type { TripSearch } from "@/types";
import { AirportInput } from "@/components/AirportInput";

interface TripStepProps {
  value: TripSearch;
  onChange: (value: TripSearch) => void;
}

export function TripStep({ value, onChange }: TripStepProps) {
  const update = (patch: Partial<TripSearch>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Where are you flying?</h2>
        <p className="mt-1 text-sm text-slate-400">
          Search by airport code, city, or name — e.g. YYC for Calgary International Airport.
        </p>
      </div>

      <div className="flex gap-2">
        {(["round_trip", "one_way"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => update({ tripType: type })}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              value.tripType === type
                ? "bg-sky-500 text-white"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {type === "round_trip" ? "Round trip" : "One way"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <AirportInput
          label="From"
          value={value.origin}
          onChange={(origin) => update({ origin })}
          placeholder="YYC"
        />
        <AirportInput
          label="To"
          value={value.destination}
          onChange={(destination) => update({ destination })}
          placeholder="LHR"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-300">Departure</span>
          <input
            type="date"
            value={value.departDate}
            onChange={(e) => update({ departDate: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </label>
        {value.tripType === "round_trip" && (
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-300">Return</span>
            <input
              type="date"
              value={value.returnDate ?? ""}
              onChange={(e) => update({ returnDate: e.target.value })}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </label>
        )}
      </div>

      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-300">Passengers</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => update({ passengers: Math.max(1, value.passengers - 1) })}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg text-white hover:bg-slate-700"
          >
            −
          </button>
          <span className="w-8 text-center text-lg font-semibold text-white">{value.passengers}</span>
          <button
            type="button"
            onClick={() => update({ passengers: Math.min(9, value.passengers + 1) })}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-lg text-white hover:bg-slate-700"
          >
            +
          </button>
        </div>
      </label>
    </div>
  );
}
