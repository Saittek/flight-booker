import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { TravelerInput } from "@/lib/amadeus/client";

export type PendingBookingStatus =
  | "pending"
  | "payment_received"
  | "booking"
  | "completed"
  | "failed";

export interface BookingResult {
  orderId: string;
  bookingReference?: string;
  total: number;
  currency: string;
  paymentIntentId?: string;
  stripeReceiptUrl?: string;
}

export interface PendingBookingRecord {
  id: string;
  paymentIntentId?: string;
  status: PendingBookingStatus;
  pricedOffer: Record<string, unknown>;
  travelers: TravelerInput[];
  expectedTotal: number;
  expectedCurrency: string;
  flightSummary: {
    airline: string;
    origin: string;
    destination: string;
    departTime: string;
  };
  result?: BookingResult;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreFile {
  bookings: PendingBookingRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_PATH = path.join(DATA_DIR, "pending-bookings.json");

function ensureStore(): StoreFile {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_PATH)) {
    const empty: StoreFile = { bookings: [] };
    fs.writeFileSync(STORE_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
  const raw = fs.readFileSync(STORE_PATH, "utf-8");
  return JSON.parse(raw) as StoreFile;
}

function writeStore(store: StoreFile): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
}

export function createPendingBooking(input: {
  pricedOffer: Record<string, unknown>;
  travelers: TravelerInput[];
  expectedTotal: number;
  expectedCurrency: string;
  flightSummary: PendingBookingRecord["flightSummary"];
}): PendingBookingRecord {
  const store = ensureStore();
  const now = new Date().toISOString();

  const record: PendingBookingRecord = {
    id: randomUUID(),
    status: "pending",
    pricedOffer: input.pricedOffer,
    travelers: input.travelers,
    expectedTotal: input.expectedTotal,
    expectedCurrency: input.expectedCurrency,
    flightSummary: input.flightSummary,
    createdAt: now,
    updatedAt: now,
  };

  store.bookings.push(record);
  writeStore(store);
  return record;
}

export function getPendingBooking(id: string): PendingBookingRecord | null {
  const store = ensureStore();
  return store.bookings.find((b) => b.id === id) ?? null;
}

export function getPendingBookingByPaymentIntent(
  paymentIntentId: string,
): PendingBookingRecord | null {
  const store = ensureStore();
  return store.bookings.find((b) => b.paymentIntentId === paymentIntentId) ?? null;
}

export function updatePendingBooking(
  id: string,
  patch: Partial<
    Pick<
      PendingBookingRecord,
      "status" | "paymentIntentId" | "result" | "error"
    >
  >,
): PendingBookingRecord | null {
  const store = ensureStore();
  const index = store.bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  store.bookings[index] = {
    ...store.bookings[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  writeStore(store);
  return store.bookings[index];
}

export function linkPaymentIntent(pendingBookingId: string, paymentIntentId: string): void {
  updatePendingBooking(pendingBookingId, { paymentIntentId });
}

export function pruneExpiredBookings(): void {
  const store = ensureStore();
  const cutoff = Date.now() - 48 * 60 * 60 * 1000;
  store.bookings = store.bookings.filter(
    (b) => new Date(b.createdAt).getTime() > cutoff || b.status === "completed",
  );
  writeStore(store);
}
