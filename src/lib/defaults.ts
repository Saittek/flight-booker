import type { BaggageProfile, SearchCriteria, SeatPreferences, TripSearch } from "@/types";

export const DEFAULT_BAGGAGE: BaggageProfile = {
  carryOn: {
    enabled: true,
    dimensions: { lengthCm: 56, widthCm: 36, heightCm: 23 },
    weightKg: 10,
  },
  personalItem: {
    enabled: true,
    dimensions: { lengthCm: 40, widthCm: 30, heightCm: 15 },
  },
  checkedBags: [{ dimensions: { lengthCm: 158, widthCm: 50, heightCm: 40 }, weightKg: 23 }],
};

export const DEFAULT_SEAT: SeatPreferences = {
  cabinClass: "economy",
  position: "any",
  location: "any",
  legroom: "standard",
  willingToUpgrade: false,
};

export const DEFAULT_TRIP: TripSearch = {
  origin: "JFK",
  destination: "LAX",
  departDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
  returnDate: "",
  tripType: "round_trip",
  passengers: 1,
};

export function buildDefaultSearch(): SearchCriteria {
  return {
    ...DEFAULT_TRIP,
    baggage: DEFAULT_BAGGAGE,
    seat: DEFAULT_SEAT,
  };
}
