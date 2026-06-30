CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY REFERENCES users(id),
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  date_of_birth TEXT,
  gender TEXT,
  email TEXT NOT NULL DEFAULT '',
  phone_number TEXT,
  country_calling_code TEXT DEFAULT '1',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id),
  order_id TEXT NOT NULL,
  booking_reference TEXT,
  airline TEXT NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  depart_time TEXT NOT NULL,
  total REAL NOT NULL,
  currency TEXT NOT NULL,
  travelers_json TEXT NOT NULL,
  payment_intent_id TEXT,
  stripe_receipt_url TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON user_tickets(user_id, created_at DESC);
