import {
  canUseLocalFileStore,
  getAccountsDb,
} from "@/lib/cloudflare/env";
import { ensureD1Schema } from "@/lib/db/schema-embedded";
import type {
  AuthUser,
  ProfileUpdateInput,
  RegisterInput,
  SaveTicketInput,
  UserProfile,
  UserTicket,
} from "@/types/auth";
import { SESSION_TTL_MS } from "@/lib/auth/constants";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

interface ProfileRow {
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  gender: string | null;
  email: string;
  phone_number: string | null;
  country_calling_code: string;
  updated_at: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  expires_at: string;
  created_at: string;
}

interface TicketRow {
  id: string;
  user_id: string;
  order_id: string;
  booking_reference: string | null;
  airline: string;
  origin: string;
  destination: string;
  depart_time: string;
  total: number;
  currency: string;
  travelers_json: string;
  payment_intent_id: string | null;
  stripe_receipt_url: string | null;
  created_at: string;
}

interface FileStore {
  users: UserRow[];
  profiles: ProfileRow[];
  sessions: SessionRow[];
  tickets: TicketRow[];
}

const LOCAL_STORE_PATH = "data/accounts.json";

function newId(): string {
  return crypto.randomUUID();
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    userId: row.user_id,
    firstName: row.first_name,
    lastName: row.last_name,
    dateOfBirth: row.date_of_birth,
    gender: row.gender === "MALE" || row.gender === "FEMALE" ? row.gender : null,
    email: row.email,
    phoneNumber: row.phone_number,
    countryCallingCode: row.country_calling_code ?? "1",
    updatedAt: row.updated_at,
  };
}

function rowToTicket(row: TicketRow): UserTicket {
  return {
    id: row.id,
    userId: row.user_id,
    orderId: row.order_id,
    bookingReference: row.booking_reference,
    airline: row.airline,
    origin: row.origin,
    destination: row.destination,
    departTime: row.depart_time,
    total: row.total,
    currency: row.currency,
    travelers: JSON.parse(row.travelers_json) as unknown[],
    paymentIntentId: row.payment_intent_id,
    stripeReceiptUrl: row.stripe_receipt_url,
    createdAt: row.created_at,
  };
}

async function readFileStore(): Promise<FileStore> {
  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const fs = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), "data");
  const storePath = path.join(process.cwd(), LOCAL_STORE_PATH);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(storePath)) {
    const empty: FileStore = { users: [], profiles: [], sessions: [], tickets: [] };
    fs.writeFileSync(storePath, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(storePath, "utf-8")) as FileStore;
}

async function writeFileStore(store: FileStore): Promise<void> {
  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const fs = await import("fs");
  const path = await import("path");
  const dataDir = path.join(process.cwd(), "data");
  const storePath = path.join(process.cwd(), LOCAL_STORE_PATH);

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findUserByEmail(email: string): Promise<(UserRow & { profile: ProfileRow }) | null> {
  const normalized = normalizeEmail(email);
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const user = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(normalized)
      .first<UserRow>();
    if (!user) return null;
    const profile = await db
      .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
      .bind(user.id)
      .first<ProfileRow>();
    if (!profile) return null;
    return { ...user, profile };
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  const user = store.users.find((u) => u.email === normalized);
  if (!user) return null;
  const profile = store.profiles.find((p) => p.user_id === user.id);
  if (!profile) return null;
  return { ...user, profile };
}

export async function findUserById(userId: string): Promise<AuthUser | null> {
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(userId).first<UserRow>();
    if (!user) return null;
    const profile = await db
      .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
      .bind(userId)
      .first<ProfileRow>();
    if (!profile) return null;
    return {
      id: user.id,
      email: user.email,
      profile: rowToProfile(profile),
    };
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) return null;
  const profile = store.profiles.find((p) => p.user_id === userId);
  if (!profile) return null;
  return {
    id: user.id,
    email: user.email,
    profile: rowToProfile(profile),
  };
}

export async function createUser(
  input: RegisterInput,
  passwordHash: string,
): Promise<AuthUser> {
  const normalized = normalizeEmail(input.email);
  const now = new Date().toISOString();
  const userId = newId();
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const existing = await db
      .prepare("SELECT id FROM users WHERE email = ?")
      .bind(normalized)
      .first();
    if (existing) throw new Error("An account with this email already exists.");

    await db
      .prepare(
        "INSERT INTO users (id, email, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
      )
      .bind(userId, normalized, passwordHash, now, now)
      .run();

    await db
      .prepare(
        `INSERT INTO user_profiles
         (user_id, first_name, last_name, date_of_birth, gender, email, phone_number, country_calling_code, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        userId,
        input.firstName.trim(),
        input.lastName.trim(),
        input.dateOfBirth ?? null,
        input.gender ?? null,
        normalized,
        input.phoneNumber?.trim() ?? null,
        input.countryCallingCode?.trim() ?? "1",
        now,
      )
      .run();

    const user = await findUserById(userId);
    if (!user) throw new Error("Failed to create account.");
    return user;
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  if (store.users.some((u) => u.email === normalized)) {
    throw new Error("An account with this email already exists.");
  }

  store.users.push({
    id: userId,
    email: normalized,
    password_hash: passwordHash,
    created_at: now,
    updated_at: now,
  });
  store.profiles.push({
    user_id: userId,
    first_name: input.firstName.trim(),
    last_name: input.lastName.trim(),
    date_of_birth: input.dateOfBirth ?? null,
    gender: input.gender ?? null,
    email: normalized,
    phone_number: input.phoneNumber?.trim() ?? null,
    country_calling_code: input.countryCallingCode?.trim() ?? "1",
    updated_at: now,
  });
  await writeFileStore(store);

  const user = await findUserById(userId);
  if (!user) throw new Error("Failed to create account.");
  return user;
}

export async function getPasswordHash(email: string): Promise<string | null> {
  const record = await findUserByEmail(email);
  return record?.password_hash ?? null;
}

export async function createSession(userId: string): Promise<{ id: string; expiresAt: string }> {
  const id = newId();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS).toISOString();
  const createdAt = now.toISOString();
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    await db
      .prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
      .bind(id, userId, expiresAt, createdAt)
      .run();
    return { id, expiresAt };
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  store.sessions.push({ id, user_id: userId, expires_at: expiresAt, created_at: createdAt });
  await writeFileStore(store);
  return { id, expiresAt };
}

export async function getSessionUser(sessionId: string): Promise<AuthUser | null> {
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const session = await db
      .prepare("SELECT * FROM sessions WHERE id = ?")
      .bind(sessionId)
      .first<SessionRow>();
    if (!session) return null;
    if (new Date(session.expires_at).getTime() <= Date.now()) {
      await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
      return null;
    }
    return findUserById(session.user_id);
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  const session = store.sessions.find((s) => s.id === sessionId);
  if (!session) return null;
  if (new Date(session.expires_at).getTime() <= Date.now()) {
    store.sessions = store.sessions.filter((s) => s.id !== sessionId);
    await writeFileStore(store);
    return null;
  }
  return findUserById(session.user_id);
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = await getAccountsDb();

  if (db) {
    await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
    return;
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  store.sessions = store.sessions.filter((s) => s.id !== sessionId);
  await writeFileStore(store);
}

export async function updateUserProfile(
  userId: string,
  patch: ProfileUpdateInput,
): Promise<UserProfile> {
  const now = new Date().toISOString();
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const current = await db
      .prepare("SELECT * FROM user_profiles WHERE user_id = ?")
      .bind(userId)
      .first<ProfileRow>();
    if (!current) throw new Error("Profile not found.");

    await db
      .prepare(
        `UPDATE user_profiles SET
         first_name = ?, last_name = ?, date_of_birth = ?, gender = ?,
         phone_number = ?, country_calling_code = ?, updated_at = ?
         WHERE user_id = ?`,
      )
      .bind(
        patch.firstName?.trim() ?? current.first_name,
        patch.lastName?.trim() ?? current.last_name,
        patch.dateOfBirth ?? current.date_of_birth,
        patch.gender ?? current.gender,
        patch.phoneNumber?.trim() ?? current.phone_number,
        patch.countryCallingCode?.trim() ?? current.country_calling_code,
        now,
        userId,
      )
      .run();

    const user = await findUserById(userId);
    if (!user) throw new Error("Profile not found.");
    return user.profile;
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  const index = store.profiles.findIndex((p) => p.user_id === userId);
  if (index === -1) throw new Error("Profile not found.");

  store.profiles[index] = {
    ...store.profiles[index],
    first_name: patch.firstName?.trim() ?? store.profiles[index].first_name,
    last_name: patch.lastName?.trim() ?? store.profiles[index].last_name,
    date_of_birth: patch.dateOfBirth ?? store.profiles[index].date_of_birth,
    gender: patch.gender ?? store.profiles[index].gender,
    phone_number: patch.phoneNumber?.trim() ?? store.profiles[index].phone_number,
    country_calling_code:
      patch.countryCallingCode?.trim() ?? store.profiles[index].country_calling_code,
    updated_at: now,
  };
  await writeFileStore(store);
  return rowToProfile(store.profiles[index]);
}

export async function saveUserTicket(input: SaveTicketInput): Promise<UserTicket> {
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const existing = await db
      .prepare("SELECT * FROM user_tickets WHERE user_id = ? AND order_id = ?")
      .bind(input.userId, input.orderId)
      .first<TicketRow>();
    if (existing) return rowToTicket(existing);
  } else if (canUseLocalFileStore()) {
    const store = await readFileStore();
    const existing = store.tickets.find(
      (t) => t.user_id === input.userId && t.order_id === input.orderId,
    );
    if (existing) return rowToTicket(existing);
  } else {
    throw new Error("DB binding is not configured.");
  }

  const id = newId();
  const now = new Date().toISOString();
  const travelersJson = JSON.stringify(input.travelers);

  if (db) {
    await db
      .prepare(
        `INSERT INTO user_tickets
         (id, user_id, order_id, booking_reference, airline, origin, destination, depart_time,
          total, currency, travelers_json, payment_intent_id, stripe_receipt_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        id,
        input.userId,
        input.orderId,
        input.bookingReference ?? null,
        input.airline,
        input.origin,
        input.destination,
        input.departTime,
        input.total,
        input.currency,
        travelersJson,
        input.paymentIntentId ?? null,
        input.stripeReceiptUrl ?? null,
        now,
      )
      .run();

    return {
      id,
      userId: input.userId,
      orderId: input.orderId,
      bookingReference: input.bookingReference ?? null,
      airline: input.airline,
      origin: input.origin,
      destination: input.destination,
      departTime: input.departTime,
      total: input.total,
      currency: input.currency,
      travelers: input.travelers,
      paymentIntentId: input.paymentIntentId ?? null,
      stripeReceiptUrl: input.stripeReceiptUrl ?? null,
      createdAt: now,
    };
  }

  const store = await readFileStore();
  const row: TicketRow = {
    id,
    user_id: input.userId,
    order_id: input.orderId,
    booking_reference: input.bookingReference ?? null,
    airline: input.airline,
    origin: input.origin,
    destination: input.destination,
    depart_time: input.departTime,
    total: input.total,
    currency: input.currency,
    travelers_json: travelersJson,
    payment_intent_id: input.paymentIntentId ?? null,
    stripe_receipt_url: input.stripeReceiptUrl ?? null,
    created_at: now,
  };
  store.tickets.unshift(row);
  await writeFileStore(store);
  return rowToTicket(row);
}

export async function listUserTickets(userId: string): Promise<UserTicket[]> {
  const db = await getAccountsDb();

  if (db) {
    await ensureD1Schema(db);
    const { results } = await db
      .prepare(
        "SELECT * FROM user_tickets WHERE user_id = ? ORDER BY created_at DESC LIMIT 50",
      )
      .bind(userId)
      .all<TicketRow>();
    return (results ?? []).map(rowToTicket);
  }

  if (!canUseLocalFileStore()) {
    throw new Error("DB binding is not configured.");
  }

  const store = await readFileStore();
  return store.tickets
    .filter((t) => t.user_id === userId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 50)
    .map(rowToTicket);
}
