import { evaluateFlight } from "@/lib/compatibility";
import type { CabinClass, FlightOffer, SearchCriteria } from "@/types";

interface AirlineTemplate {
  name: string;
  code: string;
  cabins: CabinClass[];
  priceMultiplier: Record<CabinClass, number>;
}

const AIRLINES: AirlineTemplate[] = [
  {
    name: "Southwest",
    code: "WN",
    cabins: ["economy"],
    priceMultiplier: { basic_economy: 1, economy: 1, premium_economy: 1.4, business: 2.5, first: 4 },
  },
  {
    name: "United",
    code: "UA",
    cabins: ["basic_economy", "economy", "premium_economy", "business", "first"],
    priceMultiplier: { basic_economy: 0.85, economy: 1, premium_economy: 1.55, business: 3.2, first: 5.5 },
  },
  {
    name: "Delta",
    code: "DL",
    cabins: ["basic_economy", "economy", "premium_economy", "business", "first"],
    priceMultiplier: { basic_economy: 0.88, economy: 1, premium_economy: 1.5, business: 3.0, first: 5.0 },
  },
  {
    name: "American",
    code: "AA",
    cabins: ["basic_economy", "economy", "premium_economy", "business", "first"],
    priceMultiplier: { basic_economy: 0.87, economy: 1, premium_economy: 1.48, business: 3.1, first: 5.2 },
  },
  {
    name: "JetBlue",
    code: "B6",
    cabins: ["basic_economy", "economy", "premium_economy", "business"],
    priceMultiplier: { basic_economy: 0.9, economy: 1, premium_economy: 1.45, business: 2.8, first: 4 },
  },
  {
    name: "Spirit",
    code: "NK",
    cabins: ["basic_economy", "economy"],
    priceMultiplier: { basic_economy: 0.65, economy: 0.8, premium_economy: 1.2, business: 2, first: 3 },
  },
];

const DEPART_TIMES = ["06:15", "08:40", "11:20", "14:05", "17:30", "20:10"];
const DURATIONS = ["2h 15m", "3h 40m", "4h 55m", "5h 20m", "6h 10m"];

function hashRoute(origin: string, dest: string): number {
  const s = `${origin}-${dest}`.toLowerCase();
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function addMinutes(time: string, durationStr: string): string {
  const [h, m] = time.split(":").map(Number);
  const match = durationStr.match(/(\d+)h\s*(\d+)m/);
  const addH = match ? parseInt(match[1], 10) : 0;
  const addM = match ? parseInt(match[2], 10) : 0;
  const total = h * 60 + m + addH * 60 + addM;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
}

export function searchFlights(criteria: SearchCriteria): FlightOffer[] {
  const seed = hashRoute(criteria.origin, criteria.destination);
  const baseFare = 120 + (seed % 180);
  const offers: FlightOffer[] = [];
  let id = 0;

  for (const airline of AIRLINES) {
    for (let f = 0; f < 2; f++) {
      const timeIdx = (seed + f + AIRLINES.indexOf(airline)) % DEPART_TIMES.length;
      const durIdx = (seed + f * 3) % DURATIONS.length;
      const departTime = DEPART_TIMES[timeIdx];
      const duration = DURATIONS[durIdx];
      const arriveTime = addMinutes(departTime, duration);
      const stops = (seed + f) % 3 === 0 ? 1 : 0;
      const flightNum = `${airline.code}${100 + ((seed + f * 7) % 900)}`;

      for (const cabin of airline.cabins) {
        if (criteria.seat.cabinClass !== cabin) {
          const cabinOrder = ["basic_economy", "economy", "premium_economy", "business", "first"];
          const prefIdx = cabinOrder.indexOf(criteria.seat.cabinClass);
          const cabIdx = cabinOrder.indexOf(cabin);
          if (!criteria.seat.willingToUpgrade && cabIdx > prefIdx) continue;
          if (cabIdx < prefIdx - 1) continue;
        }

        const basePrice = Math.round(
          baseFare * airline.priceMultiplier[cabin] * criteria.passengers * (stops ? 0.9 : 1),
        );

        offers.push(
          evaluateFlight(airline.name, cabin, basePrice, criteria, {
            id: `flt-${id++}`,
            source: "mock",
            airline: airline.name,
            airlineCode: airline.code,
            flightNumber: flightNum,
            origin: criteria.origin.toUpperCase(),
            destination: criteria.destination.toUpperCase(),
            departTime,
            arriveTime,
            duration,
            stops,
            priceBreakdown: {
              currency: "USD",
              base: basePrice * 0.85,
              taxes: basePrice * 0.12,
              fees: basePrice * 0.03,
              total: basePrice,
              perPassenger: basePrice / criteria.passengers,
            },
          }),
        );
      }
    }
  }

  return offers.sort((a, b) => {
    const scoreDiff = b.compatibilityScore - a.compatibilityScore;
    if (scoreDiff !== 0) return scoreDiff;
    return a.totalPriceUsd - b.totalPriceUsd;
  });
}
