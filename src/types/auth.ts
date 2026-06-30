export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  gender: "MALE" | "FEMALE" | null;
  email: string;
  phoneNumber: string | null;
  countryCallingCode: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile;
}

export interface UserTicket {
  id: string;
  userId: string;
  orderId: string;
  bookingReference: string | null;
  airline: string;
  origin: string;
  destination: string;
  departTime: string;
  total: number;
  currency: string;
  travelers: unknown[];
  paymentIntentId: string | null;
  stripeReceiptUrl: string | null;
  createdAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  countryCallingCode?: string;
}

export interface ProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: "MALE" | "FEMALE";
  phoneNumber?: string;
  countryCallingCode?: string;
}

export interface SaveTicketInput {
  userId: string;
  orderId: string;
  bookingReference?: string;
  airline: string;
  origin: string;
  destination: string;
  departTime: string;
  total: number;
  currency: string;
  travelers: unknown[];
  paymentIntentId?: string;
  stripeReceiptUrl?: string;
}
