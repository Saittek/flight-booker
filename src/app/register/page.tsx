"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthShell, inputClass } from "@/components/auth-ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE",
    countryCallingCode: "1",
    phoneNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(patch: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed.");
      router.push("/account");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your passenger details and keep all your tickets in one place."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">First name</span>
            <input
              required
              value={form.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Last name</span>
            <input
              required
              value={form.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-500">Email</span>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => update({ email: e.target.value })}
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs text-slate-500">Password (min. 8 characters)</span>
          <input
            required
            type="password"
            minLength={8}
            value={form.password}
            onChange={(e) => update({ password: e.target.value })}
            className={inputClass}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Date of birth</span>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update({ dateOfBirth: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Gender</span>
            <select
              value={form.gender}
              onChange={(e) => update({ gender: e.target.value as "MALE" | "FEMALE" })}
              className={inputClass}
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Country code</span>
            <input
              value={form.countryCallingCode}
              onChange={(e) => update({ countryCallingCode: e.target.value })}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-500">Phone</span>
            <input
              value={form.phoneNumber}
              onChange={(e) => update({ phoneNumber: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>
        {error && (
          <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-sky-500 py-3 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-400 hover:text-sky-300">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
