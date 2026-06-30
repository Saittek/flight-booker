import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import {
  createSession,
  deleteSession,
  getSessionUser,
} from "@/lib/db/accounts";
import type { AuthUser } from "@/types/auth";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;
  return getSessionUser(sessionId);
}

export function setSessionCookie(response: NextResponse, sessionId: string, expiresAt: string): void {
  response.cookies.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAt),
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export async function loginUser(userId: string): Promise<NextResponse> {
  const session = await createSession(userId);
  const response = NextResponse.json({ ok: true });
  setSessionCookie(response, session.id, session.expiresAt);
  return response;
}

export async function logoutUser(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await deleteSession(sessionId);
  }
  const response = NextResponse.json({ ok: true });
  clearSessionCookie(response);
  return response;
}

export function userToJson(user: AuthUser) {
  return {
    id: user.id,
    email: user.email,
    profile: user.profile,
  };
}
