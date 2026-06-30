const ITERATIONS = 100_000;
const KEY_LENGTH = 32;

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(b64: string): Uint8Array {
  return new Uint8Array(Buffer.from(b64, "base64"));
}

async function deriveKey(password: string, salt: Uint8Array): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    KEY_LENGTH * 8,
  );
  return new Uint8Array(hash);
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await deriveKey(password, salt);
  return `${ITERATIONS}:${toBase64(salt)}:${toBase64(hash)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [iterStr, saltB64, hashB64] = stored.split(":");
  if (!iterStr || !saltB64 || !hashB64) return false;

  const iterations = parseInt(iterStr, 10);
  if (iterations !== ITERATIONS) return false;

  const salt = fromBase64(saltB64);
  const expected = fromBase64(hashB64);
  const actual = await deriveKey(password, salt);

  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual[i] ^ expected[i];
  }
  return diff === 0;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  return null;
}
