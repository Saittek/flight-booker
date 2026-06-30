export function canUseLocalFileStore(): boolean {
  return process.env.NODE_ENV === "development";
}

export async function getCloudflareBindings(): Promise<CloudflareEnv | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    return env as CloudflareEnv;
  } catch {
    return null;
  }
}

export async function getBookingsKv(): Promise<KVNamespace | null> {
  const env = await getCloudflareBindings();
  return env?.BOOKINGS_KV ?? null;
}

export async function getAccountsDb(): Promise<D1Database | null> {
  const env = await getCloudflareBindings();
  return env?.DB ?? null;
}

export function requireBookingsKv(kv: KVNamespace | null): KVNamespace {
  if (kv) return kv;
  if (canUseLocalFileStore()) {
    throw new Error("BOOKINGS_KV binding unavailable in local dev — using file fallback.");
  }
  throw new Error("BOOKINGS_KV binding is not configured.");
}

export function requireAccountsDb(db: D1Database | null): D1Database {
  if (db) return db;
  if (canUseLocalFileStore()) {
    throw new Error("DB binding unavailable in local dev — using file fallback.");
  }
  throw new Error("DB binding is not configured.");
}

export function useSecureCookies(): boolean {
  return process.env.NODE_ENV === "production" || process.env.CF_PAGES === "1";
}
