import type { CabinClass } from "@/types";

const AMADEUS_TRAVEL_CLASS: Record<CabinClass, string> = {
  basic_economy: "ECONOMY",
  economy: "ECONOMY",
  premium_economy: "PREMIUM_ECONOMY",
  business: "BUSINESS",
  first: "FIRST",
};

export function toAmadeusTravelClass(cabin: CabinClass): string {
  return AMADEUS_TRAVEL_CLASS[cabin];
}

export function fromAmadeusCabin(cabin: string, fareBasis?: string): CabinClass {
  const basis = (fareBasis ?? "").toUpperCase();
  if (cabin === "FIRST") return "first";
  if (cabin === "BUSINESS") return "business";
  if (cabin === "PREMIUM_ECONOMY") return "premium_economy";
  if (basis.includes("BASIC") || basis.startsWith("N") || basis.includes("LIGHT")) {
    return "basic_economy";
  }
  return "economy";
}

export function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  if (!match) return iso;
  const h = match[1] ? `${match[1]}h` : "";
  const m = match[2] ? ` ${match[2]}m` : "";
  return `${h}${m}`.trim();
}

export function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  } catch {
    return iso.slice(11, 16);
  }
}
