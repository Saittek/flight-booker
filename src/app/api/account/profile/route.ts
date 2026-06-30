import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { updateUserProfile } from "@/lib/db/accounts";
import type { ProfileUpdateInput } from "@/types/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }
  return NextResponse.json({ profile: user.profile });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ProfileUpdateInput;
    const profile = await updateUserProfile(user.id, body);
    return NextResponse.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
