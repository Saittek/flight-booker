"use client";

import type { CabinClass, SeatPreferences } from "@/types";
import { CABIN_CLASS_DESCRIPTIONS, CABIN_CLASS_LABELS } from "@/types";

interface SeatStepProps {
  value: SeatPreferences;
  onChange: (value: SeatPreferences) => void;
}

const CABIN_CLASSES: CabinClass[] = [
  "basic_economy",
  "economy",
  "premium_economy",
  "business",
  "first",
];

const POSITIONS = [
  { value: "any" as const, label: "No preference" },
  { value: "window" as const, label: "Window" },
  { value: "aisle" as const, label: "Aisle" },
  { value: "middle" as const, label: "Middle" },
];

const LOCATIONS = [
  { value: "any" as const, label: "No preference" },
  { value: "front" as const, label: "Front of cabin" },
  { value: "middle" as const, label: "Middle" },
  { value: "back" as const, label: "Back (cheaper)" },
];

const LEGROOM = [
  { value: "standard" as const, label: "Standard" },
  { value: "extra" as const, label: "Extra legroom" },
  { value: "any" as const, label: "No preference" },
];

export function SeatStep({ value, onChange }: SeatStepProps) {
  const update = (patch: Partial<SeatPreferences>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Seat preferences</h2>
        <p className="mt-1 text-sm text-slate-400">
          Pick your cabin class and where you want to sit.
        </p>
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-slate-300">Cabin class</span>
        <div className="grid gap-3 sm:grid-cols-2">
          {CABIN_CLASSES.map((cabin) => (
            <button
              key={cabin}
              type="button"
              onClick={() => update({ cabinClass: cabin })}
              className={`rounded-xl border p-4 text-left transition ${
                value.cabinClass === cabin
                  ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500"
                  : "border-slate-700 bg-slate-900/50 hover:border-slate-600"
              }`}
            >
              <span className="block font-medium text-white">{CABIN_CLASS_LABELS[cabin]}</span>
              <span className="mt-1 block text-xs text-slate-400">
                {CABIN_CLASS_DESCRIPTIONS[cabin]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-slate-300">Seat position</span>
        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => update({ position: p.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                value.position === p.value
                  ? "bg-sky-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-slate-300">Cabin location</span>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => update({ location: l.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                value.location === l.value
                  ? "bg-sky-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className="mb-3 block text-sm font-medium text-slate-300">Legroom</span>
        <div className="flex flex-wrap gap-2">
          {LEGROOM.map((l) => (
            <button
              key={l.value}
              type="button"
              onClick={() => update({ legroom: l.value })}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                value.legroom === l.value
                  ? "bg-sky-500 text-white"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <label className="flex items-start gap-3 rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <input
          type="checkbox"
          checked={value.willingToUpgrade}
          onChange={(e) => update({ willingToUpgrade: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500"
        />
        <div>
          <span className="font-medium text-white">Show upgrades above my class</span>
          <p className="mt-1 text-xs text-slate-400">
            Include premium economy, business, and first class if they better fit your bags.
          </p>
        </div>
      </label>
    </div>
  );
}
