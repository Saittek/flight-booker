import { NextResponse } from "next/server";
import { mapAmadeusOffer } from "@/lib/amadeus/map-offer";
import { priceAmadeusOffer, isAmadeusConfigured } from "@/lib/amadeus/client";
import type { SearchCriteria } from "@/types";
import type { AmadeusRawOffer } from "@/lib/amadeus/client";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      offer: AmadeusRawOffer;
      criteria: SearchCriteria;
    };

    if (!body.offer || !body.criteria) {
      return NextResponse.json({ error: "Offer and search criteria required." }, { status: 400 });
    }

    if (!isAmadeusConfigured()) {
      return NextResponse.json(
        { error: "Live pricing requires Amadeus API credentials." },
        { status: 503 },
      );
    }

    const priced = await priceAmadeusOffer(body.offer, { includeBags: true });
    const mapped = mapAmadeusOffer(priced.offer, body.criteria, priced.bagsCatalog);

    if (!mapped) {
      return NextResponse.json({ error: "Could not parse priced offer." }, { status: 422 });
    }

    return NextResponse.json({
      offer: mapped,
      pricedOffer: priced.offer,
      bagsCatalog: priced.bagsCatalog,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pricing failed.";
    console.error("[flights/price]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
