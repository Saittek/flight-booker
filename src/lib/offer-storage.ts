import type { FlightOffer, SearchCriteria } from "@/types";

export const SEARCH_STORAGE_KEY = "bagmatch-search";
export const OFFERS_STORAGE_KEY = "bagmatch-offers";
export const SELECTED_OFFER_KEY = "bagmatch-selected-offer";
export const BOOKING_CONFIRMATION_KEY = "bagmatch-booking";

export function saveSearch(criteria: SearchCriteria): void {
  sessionStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(criteria));
}

export function loadSearch(): SearchCriteria | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SEARCH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SearchCriteria;
  } catch {
    return null;
  }
}

export function saveOffers(offers: FlightOffer[]): void {
  sessionStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
}

export function loadOffers(): FlightOffer[] {
  if (typeof window === "undefined") return [];
  const raw = sessionStorage.getItem(OFFERS_STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FlightOffer[];
  } catch {
    return [];
  }
}

export function saveSelectedOffer(offer: FlightOffer): void {
  sessionStorage.setItem(SELECTED_OFFER_KEY, JSON.stringify(offer));
}

export function loadSelectedOffer(): FlightOffer | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(SELECTED_OFFER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as FlightOffer;
  } catch {
    return null;
  }
}

export function saveBookingConfirmation(data: unknown): void {
  sessionStorage.setItem(BOOKING_CONFIRMATION_KEY, JSON.stringify(data));
}

export function loadBookingConfirmation<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(BOOKING_CONFIRMATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
