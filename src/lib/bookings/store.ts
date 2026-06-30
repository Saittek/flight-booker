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

const BOOKING_PREFIX = "booking:";
const PI_PREFIX = "pi:";
const TTL_SECONDS = 48 * 60 * 60;

async function getKv(): Promise<KVNamespace | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return (env as CloudflareEnv).BOOKINGS_KV ?? null;
  } catch {
    return null;
  }
}

async function readFileStore(): Promise<StoreFile> {
  const fs = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), "data");
  const storePath = path.join(dataDir, "pending-bookings.json");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(storePath)) {
    const empty: StoreFile = { bookings: [] };
    fs.writeFileSync(storePath, JSON.stringify(empty, null, 2));
    return empty;
  }

  const raw = fs.readFileSync(storePath, "utf-8");
  return JSON.parse(raw) as StoreFile;
}

async function writeFileStore(store: StoreFile): Promise<void> {
  const fs = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), "data");
  const storePath = path.join(dataDir, "pending-bookings.json");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

async function kvGetBooking(id: string, kv: KVNamespace): Promise<PendingBookingRecord | null> {
  const raw = await kv.get(`${BOOKING_PREFIX}${id}`);
  return raw ? (JSON.parse(raw) as PendingBookingRecord) : null;
}

async function kvSaveBooking(record: PendingBookingRecord, kv: KVNamespace): Promise<void> {
  await kv.put(`${BOOKING_PREFIX}${record.id}`, JSON.stringify(record), {
    expirationTtl: TTL_SECONDS,
  });
  if (record.paymentIntentId) {
    await kv.put(`${PI_PREFIX}${record.paymentIntentId}`, record.id, {
      expirationTtl: TTL_SECONDS,
    });
  }
}

export async function createPendingBooking(input: {
  pricedOffer: Record<string, unknown>;
  travelers: TravelerInput[];
  expectedTotal: number;
  expectedCurrency: string;
  flightSummary: PendingBookingRecord["flightSummary"];
}): Promise<PendingBookingRecord> {
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

  const kv = await getKv();
  if (kv) {
    await kvSaveBooking(record, kv);
    return record;
  }

  const store = await readFileStore();
  store.bookings.push(record);
  await writeFileStore(store);
  return record;
}

export async function getPendingBooking(id: string): Promise<PendingBookingRecord | null> {
  const kv = await getKv();
  if (kv) {
    return kvGetBooking(id, kv);
  }

  const store = await readFileStore();
  return store.bookings.find((b) => b.id === id) ?? null;
}

export async function getPendingBookingByPaymentIntent(
  paymentIntentId: string,
): Promise<PendingBookingRecord | null> {
  const kv = await getKv();
  if (kv) {
    const bookingId = await kv.get(`${PI_PREFIX}${paymentIntentId}`);
    if (!bookingId) return null;
    return kvGetBooking(bookingId, kv);
  }

  const store = await readFileStore();
  return store.bookings.find((b) => b.paymentIntentId === paymentIntentId) ?? null;
}

export async function updatePendingBooking(
  id: string,
  patch: Partial<
    Pick<
      PendingBookingRecord,
      "status" | "paymentIntentId" | "result" | "error"
    >
  >,
): Promise<PendingBookingRecord | null> {
  const kv = await getKv();
  if (kv) {
    const existing = await kvGetBooking(id, kv);
    if (!existing) return null;

    const updated: PendingBookingRecord = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await kvSaveBooking(updated, kv);
    return updated;
  }

  const store = await readFileStore();
  const index = store.bookings.findIndex((b) => b.id === id);
  if (index === -1) return null;

  store.bookings[index] = {
    ...store.bookings[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  await writeFileStore(store);
  return store.bookings[index];
}

export async function linkPaymentIntent(
  pendingBookingId: string,
  paymentIntentId: string,
): Promise<void> {
  await updatePendingBooking(pendingBookingId, { paymentIntentId });
}

export async function pruneExpiredBookings(): Promise<void> {
  const cutoff = Date.now() - TTL_SECONDS * 1000;
  const kv = await getKv();

  if (kv) {
    const list = await kv.list({ prefix: BOOKING_PREFIX });
    await Promise.all(
      list.keys.map(async (key) => {
        const raw = await kv.get(key.name);
        if (!raw) return;
        const record = JSON.parse(raw) as PendingBookingRecord;
        if (
          record.status !== "completed" &&
          new Date(record.createdAt).getTime() <= cutoff
        ) {
          await kv.delete(key.name);
          if (record.paymentIntentId) {
            await kv.delete(`${PI_PREFIX}${record.paymentIntentId}`);
          }
        }
      }),
    );
    return;
  }

  const store = await readFileStore();
  store.bookings = store.bookings.filter(
    (b) => new Date(b.createdAt).getTime() > cutoff || b.status === "completed",
  );
  await writeFileStore(store);
}
