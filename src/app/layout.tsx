import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AuthNav } from "@/components/AuthNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BagMatch — Find flights that fit your bags",
  description:
    "Search flights by luggage size, weight, cabin class, and seat preferences. See what's allowed before you book.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-slate-950 text-slate-100">
        <nav className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm">
                ✈
              </span>
              BagMatch
            </Link>
            <AuthNav />
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
