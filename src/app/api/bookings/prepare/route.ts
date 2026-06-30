import { NextResponse } from "next/server";
import { createPendingBooking, pruneExpiredBookings } from "@/lib/bookings/store";
import { getCurrentUser } from "@/lib/auth/session";
import type { TravelerInput } from "@/lib/amadeus/client";

export async function POST(request: Request) {
  try {
    await pruneExpiredBookings();

    const body = (await request.json()) as {
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
    };

    if (!body.pricedOffer || !body.travelers?.length) {
      return NextResponse.json(
        { error: "Priced offer and travelers required." },
        { status: 400 },
      );
    }

    for (const t of body.travelers) {
      if (!t.firstName || !t.lastName || !t.dateOfBirth || !t.email || !t.phoneNumber) {
        return NextResponse.json({ error: "All traveler fields are required." }, { status: 400 });
      }
    }

    if (!body.expectedTotal || !body.expectedCurrency) {
      return NextResponse.json({ error: "Expected total and currency required." }, { status: 400 });
    }

    const user = await getCurrentUser();

    const record = await createPendingBooking({
      userId: user?.id,
      pricedOffer: body.pricedOffer,
      travelers: body.travelers,
      expectedTotal: body.expectedTotal,
      expectedCurrency: body.expectedCurrency,
      flightSummary: body.flightSummary,
    });

    return NextResponse.json({
      pendingBookingId: record.id,
      expiresIn: "30 minutes",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not prepare booking.";
    console.error("[bookings/prepare]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
