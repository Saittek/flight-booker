export type CabinClass =
  | "basic_economy"
  | "economy"
  | "premium_economy"
  | "business"
  | "first";

export type SeatPosition = "window" | "aisle" | "middle" | "any";
export type SeatLocation = "front" | "middle" | "back" | "any";
export type LegroomPreference = "standard" | "extra" | "any";

export interface BagDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface CheckedBag {
  dimensions: BagDimensions;
  weightKg: number;
}

export interface BaggageProfile {
  carryOn: {
    enabled: boolean;
    dimensions: BagDimensions;
    weightKg: number;
  };
  personalItem: {
    enabled: boolean;
    dimensions: BagDimensions;
  };
  checkedBags: CheckedBag[];
}

export interface SeatPreferences {
  cabinClass: CabinClass;
  position: SeatPosition;
  location: SeatLocation;
  legroom: LegroomPreference;
  willingToUpgrade: boolean;
}

export interface TripSearch {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
  tripType: "one_way" | "round_trip";
  passengers: number;
}

export interface SearchCriteria extends TripSearch {
  baggage: BaggageProfile;
  seat: SeatPreferences;
}

export type CompatibilityStatus = "allowed" | "fee" | "not_allowed";

export interface BagCheckResult {
  item: string;
  status: CompatibilityStatus;
  message: string;
  feeUsd?: number;
}

export interface PriceBreakdown {
  currency: string;
  base: number;
  taxes: number;
  fees: number;
  total: number;
  perPassenger?: number;
}

export interface ReturnItinerarySummary {
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
}

export interface FlightOffer {
  id: string;
  source: "amadeus" | "mock";
  airline: string;
  airlineCode: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departTime: string;
  arriveTime: string;
  duration: string;
  stops: number;
  cabinClass: CabinClass;
  basePriceUsd: number;
  baggageFeesUsd: number;
  totalPriceUsd: number;
  seatSelectionFeeUsd: number;
  priceBreakdown: PriceBreakdown;
  baggageChecks: BagCheckResult[];
  compatibilityScore: number;
  includedCheckedBags?: number;
  carrierBaggageNotes?: string[];
  airlineBaggage?: import("@/lib/amadeus/parse-baggage").ParsedAirlineBaggage;
  seatMatch: {
    cabinAvailable: boolean;
    positionAvailable: boolean;
    extraLegroomAvailable: boolean;
    notes: string[];
  };
  returnItinerary?: ReturnItinerarySummary;
  /** Raw Amadeus offer — kept client-side for pricing/booking */
  amadeusOffer?: Record<string, unknown>;
}

export interface TravelerForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: "MALE" | "FEMALE";
  email: string;
  countryCallingCode: string;
  phoneNumber: string;
}

export interface BookingConfirmation {
  orderId: string;
  bookingReference?: string;
  airline: string;
  total: number;
  currency: string;
  origin: string;
  destination: string;
  departTime: string;
  paymentIntentId?: string;
  stripeReceiptUrl?: string;
}

export const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  basic_economy: "Basic Economy",
  economy: "Standard Economy",
  premium_economy: "Premium Economy",
  business: "Business Class",
  first: "First Class",
};

export const CABIN_CLASS_DESCRIPTIONS: Record<CabinClass, string> = {
  basic_economy:
    "Lowest fare. Often no free carry-on, no seat selection, and strict change rules.",
  economy:
    "Standard main cabin. Usually includes a carry-on and personal item.",
  premium_economy:
    "Extra legroom and wider seats. Better baggage allowance and boarding priority.",
  business: "Lie-flat or wide recliner seats, premium meals, lounge access.",
  first: "Top-tier service, largest seats, highest baggage allowance.",
};

export function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}
