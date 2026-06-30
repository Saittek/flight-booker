"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface SessionUser {
  id: string;
  email: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

export function AuthNav() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    await fetch("/api/auth/session", { method: "DELETE" });
    setUser(null);
    window.location.href = "/";
  }

  if (loading) {
    return <span className="text-xs text-slate-600">…</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/account"
          className="text-sm text-slate-300 hover:text-white"
        >
          {user.profile.firstName || user.email}
        </Link>
        <button
          type="button"
          onClick={logout}
          className="text-xs text-slate-500 hover:text-slate-300"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm text-slate-400 hover:text-white">
        Sign in
      </Link>
      <Link
        href="/register"
        className="rounded-lg bg-sky-500/20 px-3 py-1.5 text-sm font-medium text-sky-300 hover:bg-sky-500/30"
      >
        Create account
      </Link>
    </div>
  );
}
