import { evaluateFlightFromApiBaggage } from "@/lib/compatibility";
import { carrierName } from "@/lib/amadeus/carriers";
import {
  formatTime,
  fromAmadeusCabin,
  parseIsoDuration,
} from "@/lib/amadeus/helpers";
import {
  buildSegmentRouteMap,
  parseAmadeusBaggage,
  type ParsedAirlineBaggage,
} from "@/lib/amadeus/parse-baggage";
import type { AmadeusRawOffer } from "@/lib/amadeus/client";
import type { CabinClass, FlightOffer, PriceBreakdown, SearchCriteria } from "@/types";

interface AmadeusSegment {
  departure?: { iataCode?: string; at?: string };
  arrival?: { iataCode?: string; at?: string };
  carrierCode?: string;
  number?: string;
  duration?: string;
  id?: string;
}

interface AmadeusItinerary {
  duration?: string;
  segments?: AmadeusSegment[];
}

interface AmadeusPrice {
  currency?: string;
  total?: string;
  base?: string;
  grandTotal?: string;
  fees?: { amount?: string; type?: string }[];
}

interface AmadeusFareDetail {
  cabin?: string;
  fareBasis?: string;
}

interface AmadeusTravelerPricing {
  fareDetailsBySegment?: AmadeusFareDetail[];
}

function parsePriceBreakdown(price: AmadeusPrice, passengers: number): PriceBreakdown {
  const total = parseFloat(price.grandTotal ?? price.total ?? "0");
  const base = parseFloat(price.base ?? "0");
  const fees = (price.fees ?? []).reduce((sum, f) => sum + parseFloat(f.amount ?? "0"), 0);
  const taxes = Math.max(0, total - base - fees);

  return {
    currency: price.currency ?? "USD",
    base,
    taxes,
    fees,
    total,
    perPassenger: passengers > 0 ? total / passengers : total,
  };
}

export function mapAmadeusOffer(
  raw: AmadeusRawOffer,
  criteria: SearchCriteria,
  bagsCatalog?: unknown,
): FlightOffer | null {
  const itineraries = (raw.itineraries ?? []) as AmadeusItinerary[];
  if (itineraries.length === 0) return null;

  const outbound = itineraries[0];
  const segments = outbound.segments ?? [];
  if (segments.length === 0) return null;

  const first = segments[0];
  const last = segments[segments.length - 1];
  const carrierCode =
    (raw.validatingAirlineCodes as string[] | undefined)?.[0] ??
    first.carrierCode ??
    "??";
  const airline = carrierName(carrierCode);

  const pricings = (raw.travelerPricings ?? []) as AmadeusTravelerPricing[];
  const firstFare = pricings[0]?.fareDetailsBySegment?.[0];
  const cabinClass = fromAmadeusCabin(firstFare?.cabin ?? "ECONOMY", firstFare?.fareBasis);

  const price = parsePriceBreakdown((raw.price ?? {}) as AmadeusPrice, criteria.passengers);
  const segmentRoutes = buildSegmentRouteMap(raw);
  const airlineBaggage: ParsedAirlineBaggage = parseAmadeusBaggage(raw, bagsCatalog, segmentRoutes);

  const stops = segments.length - 1 + (itineraries.length > 1 ? 1 : 0);
  const flightNumbers = segments
    .map((s) => `${s.carrierCode ?? carrierCode}${s.number ?? ""}`)
    .join(" / ");

  const baseMeta = {
    id: String(raw.id ?? `${carrierCode}-${first.departure?.at}`),
    airline,
    airlineCode: carrierCode,
    flightNumber: flightNumbers,
    origin: first.departure?.iataCode ?? criteria.origin,
    destination: last.arrival?.iataCode ?? criteria.destination,
    departTime: formatTime(first.departure?.at ?? ""),
    arriveTime: formatTime(last.arrival?.at ?? ""),
    duration: parseIsoDuration(outbound.duration ?? first.duration ?? ""),
    stops,
    cabinClass,
    source: "amadeus" as const,
    priceBreakdown: price,
    includedCheckedBags: airlineBaggage.includedCheckedBagsPerPassenger,
    carrierBaggageNotes: airlineBaggage.notes,
    airlineBaggage,
    amadeusOffer: raw,
    returnItinerary:
      itineraries.length > 1
        ? {
            departTime: formatTime(itineraries[1].segments?.[0]?.departure?.at ?? ""),
            arriveTime: formatTime(
              itineraries[1].segments?.at(-1)?.arrival?.at ?? "",
            ),
            duration: parseIsoDuration(itineraries[1].duration ?? ""),
            stops: (itineraries[1].segments?.length ?? 1) - 1,
          }
        : undefined,
  };

  return evaluateFlightFromApiBaggage(
    airline,
    cabinClass,
    Math.round(price.base),
    criteria,
    baseMeta,
    airlineBaggage,
  );
}

export function mapAmadeusOffers(
  rawOffers: AmadeusRawOffer[],
  criteria: SearchCriteria,
  bagsCatalog?: unknown,
): FlightOffer[] {
  return rawOffers
    .map((o) => mapAmadeusOffer(o, criteria, bagsCatalog))
    .filter((o): o is FlightOffer => o !== null);
}
