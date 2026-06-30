import {
  AIRLINE_BAGGAGE_RULES,
  fitsDimensions,
  linearDimensions,
  type BaggageAllowance,
} from "@/lib/baggage-rules";
import type { ParsedAirlineBaggage } from "@/lib/amadeus/parse-baggage";
import type {
  BagCheckResult,
  BaggageProfile,
  CabinClass,
  FlightOffer,
  SearchCriteria,
  SeatPreferences,
} from "@/types";

const CABIN_ORDER: CabinClass[] = [
  "basic_economy",
  "economy",
  "premium_economy",
  "business",
  "first",
];

const SEAT_SELECTION_FEES: Record<CabinClass, number> = {
  basic_economy: 25,
  economy: 15,
  premium_economy: 0,
  business: 0,
  first: 0,
};

function checkBaggage(
  profile: BaggageProfile,
  allowance: BaggageAllowance,
  passengers: number,
  api?: {
    includedCheckedBags?: number;
    carryOnIncluded?: boolean | null;
    personalItemIncluded?: boolean | null;
    checkedBagFeeUsd?: number;
    carryOnFeeUsd?: number;
    checkedWeightLimit?: { weight: number; weightUnit: string };
  },
): { checks: BagCheckResult[]; totalFees: number } {
  const checks: BagCheckResult[] = [];
  let totalFees = 0;

  const freeCheckedBags =
    api?.includedCheckedBags !== undefined ? api.includedCheckedBags : allowance.checked.freeBags;

  if (api?.includedCheckedBags !== undefined) {
    const weightNote = api.checkedWeightLimit
      ? ` (max ${api.checkedWeightLimit.weight}${api.checkedWeightLimit.weightUnit} each)`
      : "";
    checks.push({
      item: "Airline allowance",
      status: "allowed",
      message: `${api.includedCheckedBags} checked bag(s) included per passenger${weightNote}`,
    });
  }

  if (profile.personalItem.enabled) {
    const fits = fitsDimensions(profile.personalItem.dimensions, allowance.personalItem.maxDimensions);
    const apiIncluded = api?.personalItemIncluded;

    if (!fits) {
      checks.push({
        item: "Personal item",
        status: "not_allowed",
        message: "Exceeds personal item size limit",
      });
    } else if (apiIncluded === false) {
      checks.push({
        item: "Personal item",
        status: "allowed",
        message: "Fits — airline allows under-seat item on this fare",
      });
    } else if (apiIncluded === true || allowance.personalItem.included) {
      checks.push({ item: "Personal item", status: "allowed", message: "Included on this fare" });
    } else {
      checks.push({ item: "Personal item", status: "allowed", message: "Fits under-seat limits" });
    }
  }

  if (profile.carryOn.enabled) {
    const dimOk = fitsDimensions(profile.carryOn.dimensions, allowance.carryOn.maxDimensions);
    const weightOk = profile.carryOn.weightKg <= allowance.carryOn.maxWeightKg;
    const carryOnFromApi = api?.carryOnIncluded;
    const carryOnFee = api?.carryOnFeeUsd ?? allowance.carryOn.feeUsd;

    if (!dimOk) {
      checks.push({
        item: "Carry-on",
        status: "not_allowed",
        message: `Exceeds ${allowance.carryOn.maxDimensions.lengthCm}×${allowance.carryOn.maxDimensions.widthCm}×${allowance.carryOn.maxDimensions.heightCm} cm limit`,
      });
    } else if (!weightOk) {
      checks.push({
        item: "Carry-on",
        status: "not_allowed",
        message: `Over ${allowance.carryOn.maxWeightKg} kg weight limit`,
      });
    } else if (carryOnFromApi === true || (allowance.carryOn.included && carryOnFromApi !== false)) {
      checks.push({
        item: "Carry-on",
        status: "allowed",
        message: carryOnFromApi === true ? "Included on this fare (airline confirmed)" : "Included free",
      });
    } else {
      const fee = carryOnFee * passengers;
      totalFees += fee;
      checks.push({
        item: "Carry-on",
        status: "fee",
        message:
          carryOnFromApi === false
            ? "Not included on this fare — pay at booking or airport"
            : "Not included — add at booking",
        feeUsd: fee,
      });
    }
  }

  profile.checkedBags.forEach((bag, i) => {
    const bagLabel = `Checked bag ${i + 1}`;
    const freeSlot = i < freeCheckedBags;
    const dimOk = linearDimensions(bag.dimensions) <= linearDimensions(allowance.checked.maxDimensions);
    const weightOk = bag.weightKg <= allowance.checked.maxWeightKg;

    if (!dimOk) {
      const fee = allowance.checked.oversizeFeeUsd * passengers;
      totalFees += fee;
      checks.push({
        item: bagLabel,
        status: "fee",
        message: "Oversized — extra fee applies",
        feeUsd: fee,
      });
    } else if (!weightOk) {
      const fee = allowance.checked.overweightFeeUsd * passengers;
      totalFees += fee;
      checks.push({
        item: bagLabel,
        status: "fee",
        message: `Over ${allowance.checked.maxWeightKg} kg — overweight fee`,
        feeUsd: fee,
      });
    } else if (freeSlot) {
      checks.push({ item: bagLabel, status: "allowed", message: "Included free" });
    } else {
      const feePerBag = api?.checkedBagFeeUsd ?? allowance.checked.feePerBagUsd;
      const fee = feePerBag * passengers;
      totalFees += fee;
      checks.push({
        item: bagLabel,
        status: "fee",
        message: api?.checkedBagFeeUsd
          ? `+$${feePerBag}/bag (airline catalog price)`
          : `+$${allowance.checked.feePerBagUsd}/bag each way`,
        feeUsd: fee,
      });
    }
  });

  return { checks, totalFees };
}

function evaluateSeatMatch(
  offeredClass: CabinClass,
  prefs: SeatPreferences,
): FlightOffer["seatMatch"] {
  const notes: string[] = [];
  const prefIndex = CABIN_ORDER.indexOf(prefs.cabinClass);
  const offerIndex = CABIN_ORDER.indexOf(offeredClass);

  const cabinAvailable = offerIndex >= prefIndex;
  if (!cabinAvailable) {
    notes.push(`Only ${offeredClass.replace("_", " ")} available — below your preference`);
  } else if (offerIndex > prefIndex) {
    notes.push("Upgrade available above your selected class");
  }

  const positionAvailable = prefs.position === "any" || offeredClass !== "basic_economy";
  if (prefs.position !== "any" && offeredClass === "basic_economy") {
    notes.push("Basic economy — seat assigned at check-in, no selection");
  } else if (prefs.position !== "any") {
    notes.push(`${prefs.position} seats available for selection`);
  }

  const extraLegroomAvailable =
    prefs.legroom !== "extra" ||
    offeredClass === "premium_economy" ||
    offeredClass === "business" ||
    offeredClass === "first";

  if (prefs.legroom === "extra" && !extraLegroomAvailable) {
    notes.push("Extra legroom seats available for additional fee");
  }

  return { cabinAvailable, positionAvailable, extraLegroomAvailable, notes };
}

function compatibilityScore(checks: BagCheckResult[], seatMatch: FlightOffer["seatMatch"]): number {
  let score = 100;
  for (const c of checks) {
    if (c.status === "not_allowed") score -= 30;
    else if (c.status === "fee") score -= 10;
  }
  if (!seatMatch.cabinAvailable) score -= 25;
  if (!seatMatch.positionAvailable) score -= 10;
  if (!seatMatch.extraLegroomAvailable) score -= 5;
  return Math.max(0, score);
}

export function evaluateFlight(
  airline: string,
  cabinClass: CabinClass,
  basePriceUsd: number,
  criteria: SearchCriteria,
  flightMeta: Omit<
    FlightOffer,
    | "baggageChecks"
    | "baggageFeesUsd"
    | "totalPriceUsd"
    | "seatSelectionFeeUsd"
    | "compatibilityScore"
    | "seatMatch"
    | "cabinClass"
    | "basePriceUsd"
  >,
): FlightOffer {
  const rules = AIRLINE_BAGGAGE_RULES[airline]?.[cabinClass];
  const allowance = rules ?? AIRLINE_BAGGAGE_RULES.United.economy;

  const { checks, totalFees } = checkBaggage(criteria.baggage, allowance, criteria.passengers);
  const seatMatch = evaluateSeatMatch(cabinClass, criteria.seat);

  let seatSelectionFee = 0;
  if (criteria.seat.position !== "any" && cabinClass === "basic_economy") {
    seatSelectionFee = SEAT_SELECTION_FEES.basic_economy * criteria.passengers;
  } else if (criteria.seat.position !== "any" && cabinClass === "economy") {
    seatSelectionFee = SEAT_SELECTION_FEES.economy * criteria.passengers;
  }
  if (criteria.seat.legroom === "extra" && cabinClass === "economy") {
    seatSelectionFee += 45 * criteria.passengers;
  }

  const baggageFeesUsd = totalFees;
  const totalPriceUsd = basePriceUsd + baggageFeesUsd + seatSelectionFee;

  const priceBreakdown = flightMeta.priceBreakdown ?? {
    currency: "USD",
    base: basePriceUsd,
    taxes: 0,
    fees: 0,
    total: basePriceUsd,
    perPassenger: criteria.passengers > 0 ? basePriceUsd / criteria.passengers : basePriceUsd,
  };

  return {
    ...flightMeta,
    source: flightMeta.source ?? "mock",
    cabinClass,
    basePriceUsd,
    baggageFeesUsd,
    seatSelectionFeeUsd: seatSelectionFee,
    totalPriceUsd,
    priceBreakdown,
    baggageChecks: checks,
    seatMatch,
    compatibilityScore: compatibilityScore(checks, seatMatch),
  };
}

export function evaluateFlightFromApiBaggage(
  airline: string,
  cabinClass: CabinClass,
  basePriceUsd: number,
  criteria: SearchCriteria,
  flightMeta: Omit<
    FlightOffer,
    | "baggageChecks"
    | "baggageFeesUsd"
    | "totalPriceUsd"
    | "seatSelectionFeeUsd"
    | "compatibilityScore"
    | "seatMatch"
    | "cabinClass"
    | "basePriceUsd"
  >,
  parsed: ParsedAirlineBaggage,
): FlightOffer {
  const rules = AIRLINE_BAGGAGE_RULES[airline]?.[cabinClass];
  const allowance = rules ?? AIRLINE_BAGGAGE_RULES.United.economy;

  const extraBagsNeeded = Math.max(
    0,
    criteria.baggage.checkedBags.length - parsed.includedCheckedBagsPerPassenger,
  );
  const catalogBagPrice = parsed.chargeableBagOptions[0]?.price;

  const { checks, totalFees } = checkBaggage(criteria.baggage, allowance, criteria.passengers, {
    includedCheckedBags: parsed.includedCheckedBagsPerPassenger,
    carryOnIncluded: parsed.carryOnIncluded,
    personalItemIncluded: parsed.personalItemIncluded,
    checkedBagFeeUsd:
      extraBagsNeeded > 0 && catalogBagPrice ? catalogBagPrice : undefined,
    checkedWeightLimit: parsed.checkedBagWeightLimit,
  });

  const seatMatch = evaluateSeatMatch(cabinClass, criteria.seat);

  const fareNotes = parsed.notes.slice(0, 4);
  if (parsed.brandedFareLabel) {
    seatMatch.notes.unshift(`Fare: ${parsed.brandedFareLabel}`);
  }
  seatMatch.notes.unshift(...fareNotes.filter((n) => !n.startsWith("Fare family")));

  let seatSelectionFee = 0;
  if (criteria.seat.position !== "any" && cabinClass === "basic_economy") {
    seatSelectionFee = SEAT_SELECTION_FEES.basic_economy * criteria.passengers;
  } else if (criteria.seat.position !== "any" && cabinClass === "economy") {
    seatSelectionFee = SEAT_SELECTION_FEES.economy * criteria.passengers;
  }
  if (criteria.seat.legroom === "extra" && cabinClass === "economy") {
    seatSelectionFee += 45 * criteria.passengers;
  }

  const priceTotal = flightMeta.priceBreakdown?.total ?? basePriceUsd;
  const baggageFeesUsd = totalFees;
  const totalPriceUsd = priceTotal + baggageFeesUsd + seatSelectionFee;

  return {
    ...flightMeta,
    cabinClass,
    basePriceUsd: flightMeta.priceBreakdown?.base ?? basePriceUsd,
    baggageFeesUsd,
    seatSelectionFeeUsd: seatSelectionFee,
    totalPriceUsd,
    baggageChecks: checks,
    seatMatch,
    compatibilityScore: compatibilityScore(checks, seatMatch),
    includedCheckedBags: parsed.includedCheckedBagsPerPassenger,
    carrierBaggageNotes: parsed.notes,
    airlineBaggage: parsed,
  };
}
