"use client";

import type { BagDimensions, BaggageProfile, CheckedBag } from "@/types";

interface BaggageStepProps {
  value: BaggageProfile;
  onChange: (value: BaggageProfile) => void;
}

function DimInputs({
  label,
  dimensions,
  onChange,
}: {
  label: string;
  dimensions: BagDimensions;
  onChange: (d: BagDimensions) => void;
}) {
  const fields: (keyof BagDimensions)[] = ["lengthCm", "widthCm", "heightCm"];
  const fieldLabels = { lengthCm: "L", widthCm: "W", heightCm: "H" };

  return (
    <div>
      <span className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
        {label} (cm)
      </span>
      <div className="flex gap-2">
        {fields.map((f) => (
          <label key={f} className="flex-1">
            <span className="mb-1 block text-xs text-slate-500">{fieldLabels[f]}</span>
            <input
              type="number"
              min={1}
              value={dimensions[f]}
              onChange={(e) => onChange({ ...dimensions, [f]: Number(e.target.value) })}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function CheckedBagEditor({
  bag,
  index,
  onChange,
  onRemove,
}: {
  bag: CheckedBag;
  index: number;
  onChange: (bag: CheckedBag) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Checked bag {index + 1}</span>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-400 hover:text-red-300"
        >
          Remove
        </button>
      </div>
      <DimInputs
        label="Dimensions"
        dimensions={bag.dimensions}
        onChange={(d) => onChange({ ...bag, dimensions: d })}
      />
      <label className="mt-3 block">
        <span className="mb-1 block text-xs text-slate-500">Weight (kg)</span>
        <input
          type="number"
          min={1}
          value={bag.weightKg}
          onChange={(e) => onChange({ ...bag, weightKg: Number(e.target.value) })}
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
        />
      </label>
    </div>
  );
}

export function BaggageStep({ value, onChange }: BaggageStepProps) {
  const update = (patch: Partial<BaggageProfile>) => onChange({ ...value, ...patch });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Your luggage</h2>
        <p className="mt-1 text-sm text-slate-400">
          We&apos;ll match flights based on what you&apos;re actually bringing.
        </p>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={value.personalItem.enabled}
            onChange={(e) =>
              update({ personalItem: { ...value.personalItem, enabled: e.target.checked } })
            }
            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500"
          />
          <span className="font-medium text-white">Personal item (under-seat bag)</span>
        </label>
        {value.personalItem.enabled && (
          <div className="mt-4">
            <DimInputs
              label="Personal item size"
              dimensions={value.personalItem.dimensions}
              onChange={(d) => update({ personalItem: { ...value.personalItem, dimensions: d } })}
            />
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-4">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={value.carryOn.enabled}
            onChange={(e) =>
              update({ carryOn: { ...value.carryOn, enabled: e.target.checked } })
            }
            className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-sky-500"
          />
          <span className="font-medium text-white">Carry-on (overhead bin)</span>
        </label>
        {value.carryOn.enabled && (
          <div className="mt-4 space-y-3">
            <DimInputs
              label="Carry-on size"
              dimensions={value.carryOn.dimensions}
              onChange={(d) => update({ carryOn: { ...value.carryOn, dimensions: d } })}
            />
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Weight (kg)</span>
              <input
                type="number"
                min={1}
                value={value.carryOn.weightKg}
                onChange={(e) =>
                  update({ carryOn: { ...value.carryOn, weightKg: Number(e.target.value) } })
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-sky-500 focus:outline-none"
              />
            </label>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="font-medium text-white">Checked bags</span>
          <button
            type="button"
            onClick={() =>
              update({
                checkedBags: [
                  ...value.checkedBags,
                  { dimensions: { lengthCm: 158, widthCm: 50, heightCm: 40 }, weightKg: 23 },
                ],
              })
            }
            disabled={value.checkedBags.length >= 4}
            className="text-sm text-sky-400 hover:text-sky-300 disabled:opacity-40"
          >
            + Add bag
          </button>
        </div>
        {value.checkedBags.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-500">
            No checked bags — carry-on only
          </p>
        ) : (
          <div className="space-y-3">
            {value.checkedBags.map((bag, i) => (
              <CheckedBagEditor
                key={i}
                bag={bag}
                index={i}
                onChange={(b) => {
                  const bags = [...value.checkedBags];
                  bags[i] = b;
                  update({ checkedBags: bags });
                }}
                onRemove={() =>
                  update({ checkedBags: value.checkedBags.filter((_, j) => j !== i) })
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
