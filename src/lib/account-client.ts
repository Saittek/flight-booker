import type { BookingConfirmation } from "@/types";
import type { TravelerForm } from "@/types";

export async function saveTicketToAccount(
  confirmation: BookingConfirmation,
  travelers: TravelerForm[],
): Promise<void> {
  try {
    await fetch("/api/account/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: confirmation.orderId,
        bookingReference: confirmation.bookingReference,
        airline: confirmation.airline,
        origin: confirmation.origin,
        destination: confirmation.destination,
        departTime: confirmation.departTime,
        total: confirmation.total,
        currency: confirmation.currency,
        travelers,
        paymentIntentId: confirmation.paymentIntentId,
        stripeReceiptUrl: confirmation.stripeReceiptUrl,
      }),
    });
  } catch {
    // Non-blocking — guest checkout still works
  }
}

export function profileToTraveler(profile: {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | null;
  email: string;
  phoneNumber: string | null;
  countryCallingCode: string;
}): Partial<TravelerForm> {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    dateOfBirth: profile.dateOfBirth ?? "",
    gender: profile.gender ?? "MALE",
    email: profile.email,
    phoneNumber: profile.phoneNumber ?? "",
    countryCallingCode: profile.countryCallingCode ?? "1",
  };
}
