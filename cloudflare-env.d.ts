interface CloudflareEnv {
  BOOKINGS_KV: KVNamespace;
  DB: D1Database;
  ASSETS: Fetcher;
  IMAGES: Fetcher;
  WORKER_SELF_REFERENCE: Fetcher;
}
