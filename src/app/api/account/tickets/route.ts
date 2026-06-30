import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserTickets, saveUserTicket } from "@/lib/db/accounts";
import type { SaveTicketInput } from "@/types/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const tickets = await listUserTickets(user.id);
  return NextResponse.json({ tickets });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as Omit<SaveTicketInput, "userId">;
    if (!body.orderId || !body.airline || !body.origin || !body.destination) {
      return NextResponse.json({ error: "Incomplete ticket data." }, { status: 400 });
    }

    const ticket = await saveUserTicket({
      userId: user.id,
      orderId: body.orderId,
      bookingReference: body.bookingReference,
      airline: body.airline,
      origin: body.origin,
      destination: body.destination,
      departTime: body.departTime,
      total: body.total,
      currency: body.currency,
      travelers: body.travelers ?? [],
      paymentIntentId: body.paymentIntentId,
      stripeReceiptUrl: body.stripeReceiptUrl,
    });

    return NextResponse.json({ ticket });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save ticket.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
