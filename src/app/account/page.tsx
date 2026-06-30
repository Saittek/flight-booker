"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getAirportByCode } from "@/lib/airports";
import { inputClass } from "@/components/auth-ui";
import { formatMoney } from "@/types";
import type { UserProfile, UserTicket } from "@/types/auth";

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        if (!session.user) {
          router.replace("/login");
          return;
        }

        const [profileRes, ticketsRes] = await Promise.all([
          fetch("/api/account/profile"),
          fetch("/api/account/tickets"),
        ]);

        if (profileRes.ok) {
          const data = await profileRes.json();
          setProfile(data.profile);
        }
        if (ticketsRes.ok) {
          const data = await ticketsRes.json();
          setTickets(data.tickets ?? []);
        }
      } catch {
        setError("Could not load your account.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: profile.firstName,
          lastName: profile.lastName,
          dateOfBirth: profile.dateOfBirth ?? undefined,
          gender: profile.gender ?? undefined,
          phoneNumber: profile.phoneNumber ?? undefined,
          countryCallingCode: profile.countryCallingCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed.");
      setProfile(data.profile);
      setMessage("Profile saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-400">
        Loading your account…
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link href="/" className="text-sm text-sky-400 hover:text-sky-300">
        ← Back to search
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-white">My account</h1>
      <p className="mt-1 text-sm text-slate-400">
        Manage your passenger details and view purchased tickets.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/80 p-6">
        <h2 className="text-lg font-semibold text-white">Personal information</h2>
        <p className="mt-1 text-sm text-slate-500">
          Used to pre-fill checkout. Email: {profile.email}
        </p>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">First name</span>
              <input
                required
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Last name</span>
              <input
                required
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Date of birth</span>
              <input
                type="date"
                value={profile.dateOfBirth ?? ""}
                onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Gender</span>
              <select
                value={profile.gender ?? "MALE"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    gender: e.target.value as "MALE" | "FEMALE",
                  })
                }
                className={inputClass}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Country code</span>
              <input
                value={profile.countryCallingCode}
                onChange={(e) =>
                  setProfile({ ...profile, countryCallingCode: e.target.value })
                }
                className={inputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-500">Phone</span>
              <input
                value={profile.phoneNumber ?? ""}
                onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                className={inputClass}
              />
            </label>
          </div>
          {message && <p className="text-sm text-emerald-400">{message}</p>}
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-sky-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save profile"}
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-white">My tickets</h2>
        {tickets.length === 0 ? (
          <p className="mt-3 rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-500">
            No tickets yet. Book a flight while signed in and it will appear here.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {tickets.map((ticket) => (
              <li
                key={ticket.id}
                className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-white">{ticket.airline}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {getAirportByCode(ticket.origin)?.city ?? ticket.origin} →{" "}
                      {getAirportByCode(ticket.destination)?.city ?? ticket.destination}
                    </p>
                    <p className="text-sm text-slate-500">Departs {ticket.departTime}</p>
                    {ticket.bookingReference && (
                      <p className="mt-2 text-sm text-sky-400">
                        Ref: {ticket.bookingReference}
                      </p>
                    )}
                    <p className="text-xs text-slate-600">Order {ticket.orderId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-white">
                      {formatMoney(ticket.total, ticket.currency)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                    {ticket.stripeReceiptUrl && (
                      <a
                        href={ticket.stripeReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-sky-400 hover:text-sky-300"
                      >
                        Receipt →
                      </a>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
