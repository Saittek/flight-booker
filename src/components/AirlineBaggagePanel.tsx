import type { FlightOffer } from "@/types";

interface AirlineBaggagePanelProps {
  offer: FlightOffer;
}

export function AirlineBaggagePanel({ offer }: AirlineBaggagePanelProps) {
  const baggage = offer.airlineBaggage;
  if (!baggage) return null;

  return (
    <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        Airline fare &amp; baggage (from Amadeus)
      </p>
      <ul className="space-y-1 text-xs text-slate-400">
        {baggage.brandedFareLabel && (
          <li>
            <span className="text-slate-300">Fare family:</span> {baggage.brandedFareLabel}
          </li>
        )}
        {baggage.fareBasis && (
          <li>
            <span className="text-slate-300">Fare basis:</span> {baggage.fareBasis}
            {baggage.bookingClass ? ` · Class ${baggage.bookingClass}` : ""}
          </li>
        )}
        <li>
          <span className="text-slate-300">Checked bags:</span>{" "}
          {baggage.includedCheckedBagsPerPassenger} included per passenger
          {baggage.checkedBagWeightLimit
            ? ` (max ${baggage.checkedBagWeightLimit.weight}${baggage.checkedBagWeightLimit.weightUnit})`
            : ""}
        </li>
        {baggage.includedCabinBagsPerPassenger > 0 && (
          <li>
            <span className="text-slate-300">Cabin bags:</span>{" "}
            {baggage.includedCabinBagsPerPassenger} included
          </li>
        )}
        {baggage.carryOnIncluded !== null && (
          <li>
            <span className="text-slate-300">Carry-on:</span>{" "}
            {baggage.carryOnIncluded ? "Included on fare" : "Not included on fare"}
          </li>
        )}
        {baggage.refundableFare && (
          <li className="text-emerald-400">Refundable fare</li>
        )}
      </ul>

      {baggage.segments.length > 1 && (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="mb-1 text-xs text-slate-500">Per segment</p>
          {baggage.segments.map((seg) => (
            <p key={seg.segmentId} className="text-xs text-slate-400">
              {seg.route ?? seg.segmentId}: {seg.includedCheckedBags.quantity} checked
              {seg.brandedFareLabel ? ` · ${seg.brandedFareLabel}` : ""}
            </p>
          ))}
        </div>
      )}

      {baggage.chargeableBagOptions.length > 0 && (
        <div className="mt-3 border-t border-slate-800 pt-3">
          <p className="mb-1 text-xs text-slate-500">Extra bags available at booking</p>
          {baggage.chargeableBagOptions.slice(0, 3).map((bag) => (
            <p key={bag.id} className="text-xs text-amber-400">
              {bag.name}: {bag.price.toFixed(2)} {bag.currency}
              {bag.weight ? ` · ${bag.weight}kg` : ""}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
