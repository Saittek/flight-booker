import { NextResponse } from "next/server";
import { isAmadeusConfigured, searchAmadeusFlights } from "@/lib/amadeus/client";
import { toAmadeusTravelClass } from "@/lib/amadeus/helpers";
import { mapAmadeusOffers } from "@/lib/amadeus/map-offer";
import { searchFlights } from "@/lib/flight-search";
import type { SearchCriteria } from "@/types";

export async function POST(request: Request) {
  try {
    const criteria = (await request.json()) as SearchCriteria;

    if (!criteria.origin || !criteria.destination || !criteria.departDate) {
      return NextResponse.json({ error: "Missing required search fields." }, { status: 400 });
    }

    if (isAmadeusConfigured()) {
      const rawOffers = await searchAmadeusFlights({
        origin: criteria.origin,
        destination: criteria.destination,
        departDate: criteria.departDate,
        returnDate:
          criteria.tripType === "round_trip" ? criteria.returnDate : undefined,
        adults: criteria.passengers,
        travelClass: toAmadeusTravelClass(criteria.seat.cabinClass),
        maxOffers: 30,
      });

      const offers = mapAmadeusOffers(rawOffers, criteria);

      return NextResponse.json({
        offers,
        source: "amadeus",
        count: offers.length,
      });
    }

    const offers = searchFlights(criteria);
    return NextResponse.json({
      offers,
      source: "mock",
      count: offers.length,
      message:
        "Using demo data. Add AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET to .env.local for live flights.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Flight search failed.";
    console.error("[flights/search]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
