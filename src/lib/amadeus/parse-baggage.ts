import type { AmadeusRawOffer } from "@/lib/amadeus/client";

export interface BagWeightLimit {
  quantity: number;
  weight?: number;
  weightUnit?: string;
}

export interface BaggageAmenity {
  description: string;
  amenityType: string;
  isChargeable: boolean;
  provider?: string;
}

export interface SegmentBaggageDetail {
  segmentId: string;
  route?: string;
  cabin: string;
  fareBasis?: string;
  brandedFare?: string;
  brandedFareLabel?: string;
  bookingClass?: string;
  includedCheckedBags: BagWeightLimit;
  includedCabinBags?: BagWeightLimit;
  chargeableCheckedBags?: { quantity?: number; weight?: number; weightUnit?: string };
  amenities: BaggageAmenity[];
}

export interface ChargeableBagOption {
  id: string;
  name: string;
  price: number;
  currency: string;
  quantity?: number;
  weight?: number;
  weightUnit?: string;
}

export interface ParsedAirlineBaggage {
  includedCheckedBagsPerPassenger: number;
  checkedBagWeightLimit?: { weight: number; weightUnit: string };
  includedCabinBagsPerPassenger: number;
  cabinBagWeightLimit?: { weight: number; weightUnit: string };
  carryOnIncluded: boolean | null;
  personalItemIncluded: boolean | null;
  brandedFare?: string;
  brandedFareLabel?: string;
  fareBasis?: string;
  bookingClass?: string;
  includedCheckedBagsOnly: boolean;
  refundableFare: boolean;
  noPenaltyFare: boolean;
  segments: SegmentBaggageDetail[];
  notes: string[];
  chargeableBagOptions: ChargeableBagOption[];
}

interface AmadeusFareDetail {
  segmentId?: string;
  cabin?: string;
  fareBasis?: string;
  brandedFare?: string;
  brandedFareLabel?: string;
  class?: string;
  includedCheckedBags?: { quantity?: number; weight?: number; weightUnit?: string };
  includedCabinBags?: { quantity?: number; weight?: number; weightUnit?: string };
  additionalServices?: {
    chargeableCheckedBags?: { quantity?: number; weight?: number; weightUnit?: string };
  };
  amenities?: {
    description?: string;
    isChargeable?: boolean;
    amenityType?: string;
    amenityProvider?: { name?: string };
  }[];
}

interface AmadeusTravelerPricing {
  travelerId?: string;
  fareDetailsBySegment?: AmadeusFareDetail[];
}

interface AmadeusPricingOptions {
  includedCheckedBagsOnly?: boolean;
  refundableFare?: boolean;
  noPenaltyFare?: boolean;
  fareType?: string[];
}

interface AmadeusBagCatalogEntry {
  quantity?: number;
  weight?: number;
  name?: string;
  price?: { amount?: string; currencyCode?: string };
}

function bagLimit(raw?: {
  quantity?: number;
  weight?: number;
  weightUnit?: string;
}): BagWeightLimit {
  return {
    quantity: raw?.quantity ?? 0,
    weight: raw?.weight,
    weightUnit: raw?.weightUnit,
  };
}

function formatWeight(limit: BagWeightLimit): string {
  if (limit.weight && limit.weightUnit) {
    return `${limit.quantity}× up to ${limit.weight}${limit.weightUnit}`;
  }
  return `${limit.quantity}`;
}

function inferCarryOnFromAmenities(amenities: BaggageAmenity[]): boolean | null {
  let carryOn: boolean | null = null;
  let personalItem: boolean | null = null;

  for (const a of amenities) {
    const desc = a.description.toUpperCase();
    const isBaggage =
      a.amenityType === "BAGGAGE" ||
      a.amenityType === "BRANDED_FARES" ||
      desc.includes("BAG") ||
      desc.includes("CARRY") ||
      desc.includes("HAND");

    if (!isBaggage) continue;

    const isCarryOn =
      desc.includes("CABIN BAG") ||
      desc.includes("CARRY ON") ||
      desc.includes("CARRY-ON") ||
      desc.includes("HAND BAG") ||
      desc.includes("HANDBAG") ||
      desc.includes("OVERHEAD");

    const isPersonal =
      desc.includes("PERSONAL") ||
      desc.includes("UNDERSEAT") ||
      desc.includes("SMALL BAG") ||
      desc.includes("PERSONAL ITEM");

    const isChecked =
      desc.includes("CHECKED") ||
      desc.includes("HOLD BAG") ||
      desc.includes("1ST BAG") ||
      desc.includes("1ST CHECKED");

    if (isCarryOn && !isChecked) {
      carryOn = !a.isChargeable;
    }
    if (isPersonal) {
      personalItem = !a.isChargeable;
    }

    if (desc.includes("NO BAG") || desc.includes("NO CARRY") || desc.includes("BAG NOT INCLUDED")) {
      carryOn = false;
    }
  }

  return carryOn ?? personalItem ?? null;
}

function parseBagCatalog(raw: unknown): ChargeableBagOption[] {
  if (!raw || typeof raw !== "object") return [];

  const catalog = raw as Record<string, AmadeusBagCatalogEntry>;
  return Object.entries(catalog).map(([id, entry]) => ({
    id,
    name: entry.name ?? "Checked bag",
    price: parseFloat(entry.price?.amount ?? "0"),
    currency: entry.price?.currencyCode ?? "USD",
    quantity: entry.quantity,
    weight: entry.weight,
    weightUnit: "KG",
  }));
}

export function parseAmadeusBaggage(
  offer: AmadeusRawOffer,
  bagsCatalog?: unknown,
  segmentRoutes?: Map<string, string>,
): ParsedAirlineBaggage {
  const pricings = (offer.travelerPricings ?? []) as AmadeusTravelerPricing[];
  const pricingOptions = (offer.pricingOptions ?? {}) as AmadeusPricingOptions;

  const segments: SegmentBaggageDetail[] = [];
  const allAmenities: BaggageAmenity[] = [];
  let minChecked = Infinity;
  let minCabin = Infinity;
  let checkedWeight: { weight: number; weightUnit: string } | undefined;
  let cabinWeight: { weight: number; weightUnit: string } | undefined;

  let brandedFare: string | undefined;
  let brandedFareLabel: string | undefined;
  let fareBasis: string | undefined;
  let bookingClass: string | undefined;

  for (const tp of pricings) {
    for (const fd of tp.fareDetailsBySegment ?? []) {
      const checked = bagLimit(fd.includedCheckedBags);
      const cabin = bagLimit(fd.includedCabinBags);

      minChecked = Math.min(minChecked, checked.quantity);
      minCabin = Math.min(minCabin, cabin.quantity);

      if (checked.weight && checked.weightUnit) {
        checkedWeight = { weight: checked.weight, weightUnit: checked.weightUnit };
      }
      if (cabin.weight && cabin.weightUnit) {
        cabinWeight = { weight: cabin.weight, weightUnit: cabin.weightUnit };
      }

      brandedFare = brandedFare ?? fd.brandedFare;
      brandedFareLabel = brandedFareLabel ?? fd.brandedFareLabel;
      fareBasis = fareBasis ?? fd.fareBasis;
      bookingClass = bookingClass ?? fd.class;

      const amenities: BaggageAmenity[] = (fd.amenities ?? []).map((a) => ({
        description: a.description ?? "",
        amenityType: a.amenityType ?? "UNKNOWN",
        isChargeable: a.isChargeable ?? false,
        provider: a.amenityProvider?.name,
      }));

      allAmenities.push(...amenities);

      segments.push({
        segmentId: fd.segmentId ?? "?",
        route: segmentRoutes?.get(fd.segmentId ?? ""),
        cabin: fd.cabin ?? "ECONOMY",
        fareBasis: fd.fareBasis,
        brandedFare: fd.brandedFare,
        brandedFareLabel: fd.brandedFareLabel,
        bookingClass: fd.class,
        includedCheckedBags: checked,
        includedCabinBags: fd.includedCabinBags ? cabin : undefined,
        chargeableCheckedBags: fd.additionalServices?.chargeableCheckedBags,
        amenities,
      });
    }
  }

  const includedCheckedBagsPerPassenger = minChecked === Infinity ? 0 : minChecked;
  const includedCabinBagsPerPassenger = minCabin === Infinity ? 0 : minCabin;

  const carryOnFromCabin = includedCabinBagsPerPassenger > 0 ? true : null;
  const carryOnFromAmenities = inferCarryOnFromAmenities(allAmenities);

  let carryOnIncluded: boolean | null = carryOnFromAmenities ?? carryOnFromCabin;
  let personalItemIncluded: boolean | null = null;

  for (const a of allAmenities) {
    const desc = a.description.toUpperCase();
    if (desc.includes("PERSONAL") || desc.includes("UNDERSEAT")) {
      personalItemIncluded = !a.isChargeable;
    }
  }

  if (brandedFare?.toUpperCase().includes("LIGHT") || brandedFare?.toUpperCase().includes("BASIC")) {
    carryOnIncluded = carryOnIncluded ?? false;
  }

  const notes: string[] = [];
  const chargeableBagOptions = parseBagCatalog(bagsCatalog);

  if (brandedFareLabel || brandedFare) {
    notes.push(`Fare family: ${brandedFareLabel ?? brandedFare}`);
  }
  if (fareBasis) {
    notes.push(`Fare basis: ${fareBasis}${bookingClass ? ` (class ${bookingClass})` : ""}`);
  }
  notes.push(
    `Checked bags included: ${formatWeight({ quantity: includedCheckedBagsPerPassenger, ...checkedWeight })} per passenger`,
  );
  if (includedCabinBagsPerPassenger > 0) {
    notes.push(
      `Cabin bags included: ${formatWeight({ quantity: includedCabinBagsPerPassenger, ...cabinWeight })} per passenger`,
    );
  }

  for (const a of allAmenities) {
    if (
      a.amenityType === "BAGGAGE" ||
      a.description.toUpperCase().includes("BAG") ||
      a.description.toUpperCase().includes("CARRY")
    ) {
      notes.push(`${a.description}${a.isChargeable ? " (extra charge)" : " (included)"}`);
    }
  }

  for (const seg of segments) {
    if (seg.brandedFareLabel) {
      notes.push(`${seg.route ?? `Segment ${seg.segmentId}`}: ${seg.brandedFareLabel}`);
    }
  }

  if (chargeableBagOptions.length > 0) {
    const cheapest = chargeableBagOptions[0];
    notes.push(
      `Extra checked bag from ${cheapest.price.toFixed(2)} ${cheapest.currency} (airline catalog)`,
    );
  }

  if (pricingOptions.includedCheckedBagsOnly) {
    notes.push("This search filter: fares with included checked bags only");
  }
  if (pricingOptions.refundableFare) {
    notes.push("Refundable fare");
  }

  const priceAdditional = (offer.price as { additionalServices?: { amount?: string; type?: string }[] })
    ?.additionalServices;
  if (priceAdditional?.length) {
    for (const svc of priceAdditional) {
      if (svc.type?.includes("BAG") || svc.type?.includes("CHECKED")) {
        notes.push(`Additional service: ${svc.type} — ${svc.amount}`);
      }
    }
  }

  return {
    includedCheckedBagsPerPassenger,
    checkedBagWeightLimit: checkedWeight,
    includedCabinBagsPerPassenger,
    cabinBagWeightLimit: cabinWeight,
    carryOnIncluded,
    personalItemIncluded,
    brandedFare,
    brandedFareLabel,
    fareBasis,
    bookingClass,
    includedCheckedBagsOnly: pricingOptions.includedCheckedBagsOnly ?? false,
    refundableFare: pricingOptions.refundableFare ?? false,
    noPenaltyFare: pricingOptions.noPenaltyFare ?? false,
    segments,
    notes: [...new Set(notes.filter(Boolean))],
    chargeableBagOptions,
  };
}

export function buildSegmentRouteMap(offer: AmadeusRawOffer): Map<string, string> {
  const map = new Map<string, string>();
  const itineraries = (offer.itineraries ?? []) as {
    segments?: { id?: string; departure?: { iataCode?: string }; arrival?: { iataCode?: string } }[];
  }[];

  for (const it of itineraries) {
    for (const seg of it.segments ?? []) {
      if (seg.id && seg.departure?.iataCode && seg.arrival?.iataCode) {
        map.set(seg.id, `${seg.departure.iataCode}→${seg.arrival.iataCode}`);
      }
    }
  }
  return map;
}
