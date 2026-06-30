import { saveUserTicket } from "@/lib/db/accounts";
import type { PendingBookingRecord } from "@/lib/bookings/store";
import type { BookingResult } from "@/lib/bookings/store";

export async function persistTicketForUser(
  userId: string,
  pending: PendingBookingRecord,
  result: BookingResult,
): Promise<void> {
  await saveUserTicket({
    userId,
    orderId: result.orderId,
    bookingReference: result.bookingReference,
    airline: pending.flightSummary.airline,
    origin: pending.flightSummary.origin,
    destination: pending.flightSummary.destination,
    departTime: pending.flightSummary.departTime,
    total: result.total,
    currency: result.currency,
    travelers: pending.travelers,
    paymentIntentId: result.paymentIntentId,
    stripeReceiptUrl: result.stripeReceiptUrl,
  });
}
