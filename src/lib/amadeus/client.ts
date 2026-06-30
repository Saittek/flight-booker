export function isAmadeusConfigured(): boolean {
  return Boolean(process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET);
}

function getAmadeusBaseUrl(): string {
  return process.env.AMADEUS_HOSTNAME === "production"
    ? "https://api.amadeus.com"
    : "https://test.api.amadeus.com";
}

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt - 60_000) {
    return tokenCache.token;
  }

  if (!isAmadeusConfigured()) {
    throw new Error("Amadeus API credentials are not configured.");
  }

  const response = await fetch(`${getAmadeusBaseUrl()}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Amadeus auth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

async function amadeusFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${getAmadeusBaseUrl()}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Amadeus API error (${response.status}): ${text}`);
  }

  return response;
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
  const query = new URLSearchParams({
    originLocationCode: params.origin.toUpperCase(),
    destinationLocationCode: params.destination.toUpperCase(),
    departureDate: params.departDate,
    adults: String(params.adults),
    max: String(params.maxOffers ?? 25),
    currencyCode: "USD",
  });

  if (params.returnDate) {
    query.set("returnDate", params.returnDate);
  }
  if (params.travelClass) {
    query.set("travelClass", params.travelClass);
  }

  const response = await amadeusFetch(`/v2/shopping/flight-offers?${query.toString()}`);
  const json = (await response.json()) as { data?: AmadeusRawOffer[] };
  return json.data ?? [];
}

export async function priceAmadeusOffer(
  offer: AmadeusRawOffer,
  options?: { includeBags?: boolean },
): Promise<AmadeusPriceResult> {
  const path = options?.includeBags
    ? "/v1/shopping/flight-offers/pricing?include=bags"
    : "/v1/shopping/flight-offers/pricing";

  const response = await amadeusFetch(path, {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "flight-offers-pricing",
        flightOffers: [offer],
      },
    }),
  });

  const data = (await response.json()) as {
    data?: {
      flightOffers?: AmadeusRawOffer[];
      bags?: unknown;
    };
  };

  const priced = data?.data?.flightOffers?.[0];
  if (!priced) {
    throw new Error("Could not confirm price for this flight.");
  }

  return {
    offer: priced,
    bagsCatalog: data?.data?.bags,
    fullData: data?.data,
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
  const response = await amadeusFetch("/v1/booking/flight-orders", {
    method: "POST",
    body: JSON.stringify({
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
    }),
  });

  const json = (await response.json()) as { data?: Record<string, unknown> };
  if (!json.data) {
    throw new Error("Amadeus booking returned no order data.");
  }
  return json.data;
}

/** @deprecated Use fetch-based functions directly. Kept for any legacy imports. */
export function getAmadeusClient(): never {
  throw new Error("Amadeus Node SDK is not used on Cloudflare Workers.");
}
