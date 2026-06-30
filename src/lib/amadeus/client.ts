import Amadeus from "amadeus";

let client: Amadeus | null = null;

export function isAmadeusConfigured(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

export function getAmadeusClient(): Amadeus {
  if (!isAmadeusConfigured()) {
    throw new Error("Amadeus API credentials are not configured.");
  }

  if (!client) {
    client = new Amadeus({
      clientId: process.env.AMADEUS_CLIENT_ID!,
      clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
      hostname: process.env.AMADEUS_HOSTNAME === "production" ? "production" : "test",
    });
  }

  return client;
}

export type AmadeusRawOffer = Record<string, unknown>;

export interface AmadeusPriceResult {
  offer: AmadeusRawOffer;
  bagsCatalog?: unknown;
  fullData?: unknown;
}

export interface AmadeusSearchParams {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  adults: number;
  travelClass?: string;
  maxOffers?: number;
}

export async function searchAmadeusFlights(params: AmadeusSearchParams): Promise<AmadeusRawOffer[]> {
  const amadeus = getAmadeusClient();

  const query: Record<string, string> = {
    originLocationCode: params.origin.toUpperCase(),
    destinationLocationCode: params.destination.toUpperCase(),
    departureDate: params.departDate,
    adults: String(params.adults),
    max: String(params.maxOffers ?? 25),
    currencyCode: "USD",
  };

  if (params.returnDate) {
    query.returnDate = params.returnDate;
  }

  if (params.travelClass) {
    query.travelClass = params.travelClass;
  }

  const response = await amadeus.shopping.flightOffersSearch.get(query);
  return (response.data ?? []) as AmadeusRawOffer[];
}

export async function priceAmadeusOffer(
  offer: AmadeusRawOffer,
  options?: { includeBags?: boolean },
): Promise<AmadeusPriceResult> {
  const amadeus = getAmadeusClient();

  const path = options?.includeBags
    ? "/v1/shopping/flight-offers/pricing?include=bags"
    : "/v1/shopping/flight-offers/pricing";

  const response = await amadeus.client.post(
    path,
    {
      data: {
        type: "flight-offers-pricing",
        flightOffers: [offer],
      },
    },
  );

  const data = response.data as {
    flightOffers?: AmadeusRawOffer[];
    bags?: unknown;
  };

  const priced = data?.flightOffers?.[0];
  if (!priced) {
    throw new Error("Could not confirm price for this flight.");
  }

  return {
    offer: priced,
    bagsCatalog: data?.bags,
    fullData: data,
  };
}

export interface TravelerInput {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  email: string;
  countryCallingCode: string;
  phoneNumber: string;
}

export async function bookAmadeusFlight(
  pricedOffer: AmadeusRawOffer,
  travelers: TravelerInput[],
): Promise<Record<string, unknown>> {
  const amadeus = getAmadeusClient();

  const response = await amadeus.booking.flightOrders.post({
    data: {
      type: "flight-order",
      flightOffers: [pricedOffer],
      travelers: travelers.map((t) => ({
        id: t.id,
        dateOfBirth: t.dateOfBirth,
        name: { firstName: t.firstName, lastName: t.lastName },
        gender: t.gender,
        contact: {
          emailAddress: t.email,
          phones: [
            {
              deviceType: "MOBILE",
              countryCallingCode: t.countryCallingCode,
              number: t.phoneNumber,
            },
          ],
        },
      })),
      remarks: {
        general: [{ subType: "GENERAL_MISCELLANEOUS", text: "Booked via BagMatch" }],
      },
      ticketingAgreement: {
        option: "DELAY_TO_CANCEL",
        delay: "6D",
      },
    },
  });

  return response.data as Record<string, unknown>;
}
