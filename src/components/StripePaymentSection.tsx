"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import type { FlightOffer, TravelerForm } from "@/types";
import { formatMoney } from "@/types";
import type { BookingResult } from "@/lib/bookings/store";

function travelersValid(travelers: TravelerForm[]): boolean {
  return travelers.every(
    (t) =>
      t.firstName.trim() &&
      t.lastName.trim() &&
      t.dateOfBirth &&
      t.email.trim() &&
      t.countryCallingCode.trim() &&
      t.phoneNumber.trim(),
  );
}

function buildTravelerPayload(
  travelers: TravelerForm[],
  rawPricedOffer: Record<string, unknown>,
) {
  const travelerIds = (
    (rawPricedOffer.travelerPricings as { travelerId?: string }[] | undefined) ?? []
  ).map((tp, i) => tp.travelerId ?? String(i + 1));

  return travelers.map((t, i) => ({
    id: travelerIds[i] ?? String(i + 1),
    firstName: t.firstName,
    lastName: t.lastName,
    dateOfBirth: t.dateOfBirth,
    gender: t.gender,
    email: travelers[0].email,
    countryCallingCode: t.countryCallingCode,
    phoneNumber: t.phoneNumber,
  }));
}

async function pollBookingStatus(
  paymentIntentId: string,
  maxAttempts = 30,
): Promise<BookingResult> {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`/api/bookings/status?paymentIntentId=${paymentIntentId}`);
    if (res.ok) {
      const data = await res.json();
      if (data.status === "completed" && data.result) {
        return data.result as BookingResult;
      }
      if (data.status === "failed") {
        throw new Error(data.error ?? "Booking failed after payment.");
      }
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
  throw new Error("Booking is taking longer than expected. Check your email for confirmation.");
}

interface StripePaymentSectionProps {
  offer: FlightOffer;
  travelers: TravelerForm[];
  agreed: boolean;
  rawPricedOffer: Record<string, unknown> | null;
  onSuccess: (result: BookingResult) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

function PaymentForm({
  offer,
  travelers,
  agreed,
  rawPricedOffer,
  webhookConfigured,
  onSuccess,
  onError,
  disabled,
}: StripePaymentSectionProps & { webhookConfigured: boolean }) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const currency = offer.priceBreakdown.currency ?? "USD";

  async function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements || !agreed) {
      onError(agreed ? "Payment not ready." : "Please accept the fare rules.");
      return;
    }
    if (!rawPricedOffer) {
      onError("Flight price not confirmed yet.");
      return;
    }
    if (!travelersValid(travelers)) {
      onError("Please complete all passenger details before paying.");
      return;
    }

    setProcessing(true);
    onError("");

    const { error: submitError } = await elements.submit();
    if (submitError) {
      onError(submitError.message ?? "Payment validation failed.");
      setProcessing(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      onError(error.message ?? "Payment failed.");
      setProcessing(false);
      return;
    }

    if (paymentIntent?.status !== "succeeded") {
      onError(`Unexpected payment status: ${paymentIntent?.status}`);
      setProcessing(false);
      return;
    }

    try {
      if (webhookConfigured) {
        const result = await pollBookingStatus(paymentIntent.id);
        onSuccess(result);
      } else {
        const res = await fetch("/api/flights/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            expectedTotal: offer.totalPriceUsd,
            expectedCurrency: currency,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Booking failed.");
        onSuccess(data as BookingResult);
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Booking failed after payment.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <h2 className="text-lg font-semibold text-white">Payment</h2>
      {webhookConfigured && (
        <p className="text-xs text-emerald-400">
          Secured checkout — your flight is booked automatically after payment is verified by
          Stripe.
        </p>
      )}
      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing || disabled || !agreed}
        className="w-full rounded-xl bg-sky-500 py-3.5 text-sm font-semibold text-white hover:bg-sky-400 disabled:opacity-50"
      >
        {processing
          ? webhookConfigured
            ? "Payment received — booking your flight…"
            : "Processing payment…"
          : `Pay ${formatMoney(offer.totalPriceUsd, currency)} & book flight`}
      </button>
    </form>
  );
}

export function StripePaymentSection(props: StripePaymentSectionProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);
  const [webhookConfigured, setWebhookConfigured] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [settingUp, setSettingUp] = useState(false);

  const setupPayment = useCallback(async () => {
    if (!props.rawPricedOffer || !travelersValid(props.travelers)) return;

    setSettingUp(true);
    setLoadError("");

    try {
      const configRes = await fetch("/api/payments/create-intent", { method: "GET" });
      const config = await configRes.json();
      if (!config.configured || !config.publishableKey) {
        setLoadError("Stripe is not configured.");
        return;
      }

      setPublishableKey(config.publishableKey);
      setWebhookConfigured(Boolean(config.webhookConfigured));

      const travelerPayload = buildTravelerPayload(props.travelers, props.rawPricedOffer);

      const prepareRes = await fetch("/api/bookings/prepare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pricedOffer: props.rawPricedOffer,
          travelers: travelerPayload,
          expectedTotal: props.offer.totalPriceUsd,
          expectedCurrency: props.offer.priceBreakdown.currency ?? "USD",
          flightSummary: {
            airline: props.offer.airline,
            origin: props.offer.origin,
            destination: props.offer.destination,
            departTime: props.offer.departTime,
          },
        }),
      });
      const prepareData = await prepareRes.json();
      if (!prepareRes.ok) throw new Error(prepareData.error ?? "Could not prepare booking");

      const intentRes = await fetch("/api/payments/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: props.offer.totalPriceUsd,
          currency: props.offer.priceBreakdown.currency ?? "USD",
          offerId: props.offer.id,
          pendingBookingId: prepareData.pendingBookingId,
          email: props.travelers[0]?.email || undefined,
          description: `${props.offer.airline} ${props.offer.origin}→${props.offer.destination}`,
        }),
      });
      const intentData = await intentRes.json();
      if (!intentRes.ok) throw new Error(intentData.error ?? "Could not start payment");

      setClientSecret(intentData.clientSecret);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Payment setup failed.");
      setClientSecret(null);
    } finally {
      setSettingUp(false);
    }
  }, [props.offer, props.travelers, props.rawPricedOffer]);

  useEffect(() => {
    if (props.offer.source !== "amadeus" || props.offer.totalPriceUsd <= 0) return;
    if (!travelersValid(props.travelers) || !props.rawPricedOffer) {
      setClientSecret(null);
      return;
    }
    setupPayment();
  }, [props.offer.source, props.offer.totalPriceUsd, props.travelers, props.rawPricedOffer, setupPayment]);

  if (loadError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-red-400">{loadError}</p>
        <button
          type="button"
          onClick={setupPayment}
          className="text-sm text-sky-400 hover:text-sky-300"
        >
          Retry payment setup
        </button>
      </div>
    );
  }

  if (!travelersValid(props.travelers)) {
    return (
      <p className="text-sm text-slate-500">
        Complete all passenger details above to enable card payment.
      </p>
    );
  }

  if (settingUp || !publishableKey || !clientSecret) {
    return (
      <p className="text-sm text-slate-500">
        {settingUp ? "Preparing secure checkout…" : "Loading payment form…"}
      </p>
    );
  }

  const stripePromise = loadStripe(publishableKey);
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: "night",
      variables: {
        colorPrimary: "#0ea5e9",
        colorBackground: "#0f172a",
        colorText: "#f1f5f9",
        borderRadius: "12px",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm {...props} webhookConfigured={webhookConfigured} />
    </Elements>
  );
}
