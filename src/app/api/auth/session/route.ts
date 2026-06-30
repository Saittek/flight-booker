import { NextResponse } from "next/server";
import { hashPassword, validatePassword, verifyPassword } from "@/lib/auth/password";
import { getCurrentUser, loginUser, userToJson } from "@/lib/auth/session";
import {
  createUser,
  findUserByEmail,
} from "@/lib/db/accounts";
import type { RegisterInput } from "@/types/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user: userToJson(user) });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterInput;

    if (!body.email?.trim() || !body.password || !body.firstName?.trim() || !body.lastName?.trim()) {
      return NextResponse.json(
        { error: "Email, password, first name, and last name are required." },
        { status: 400 },
      );
    }

    const passwordError = validatePassword(body.password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.password);
    const user = await createUser(body, passwordHash);
    return loginUser(user.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Registration failed.";
    const status = message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };

    if (!body.email?.trim() || !body.password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const record = await findUserByEmail(body.email);
    if (!record) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const valid = await verifyPassword(body.password, record.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    return loginUser(record.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Login failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE() {
  const { logoutUser } = await import("@/lib/auth/session");
  return logoutUser();
}
