"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, ArrowRight } from "lucide-react";

import { BRAND, type ServiceKind } from "../_data/config";
import { submitRideRequest, type RideRequestInput } from "../actions";

type Props = {
  service: ServiceKind;
  subject: string;
  category?: string;
  priceRange?: string;
  defaultCity?: string;
  cities: readonly string[];
  variant?: "modal" | "inline";
  onClose?: () => void;
};

const SERVICE_COPY: Record<ServiceKind, { cityLabel: string; dateLabel: string; cta: string }> = {
  car: { cityLabel: "Pickup city", dateLabel: "Start date", cta: "Submit request" },
  jet: { cityLabel: "Departure city", dateLabel: "Departure date", cta: "Request charter" },
  cruise: { cityLabel: "Location", dateLabel: "Cruise date", cta: "Request cruise" },
};

export function RequestForm({
  service,
  subject,
  category,
  priceRange,
  defaultCity,
  cities,
  variant = "inline",
  onClose,
}: Props) {
  const copy = SERVICE_COPY[service];
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    city: defaultCity && cities.includes(defaultCity) ? defaultCity : cities[0],
    startDate: "",
    endDate: "",
    route: "",
    passengers: "",
    note: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string>("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const whatsappHref = useMemo(() => {
    const lines = [
      "Hello GTi Rides, I just submitted a request.",
      reference ? `Ref: ${reference}` : "",
      `Item: ${subject}`,
      `City: ${form.city}`,
      form.route ? `Route: ${form.route}` : "",
      form.passengers ? `Guests: ${form.passengers}` : "",
      form.endDate ? `Date: ${form.startDate} to ${form.endDate}` : `Date: ${form.startDate}`,
      `Name: ${form.fullName}`,
      `Phone: ${form.phone}`,
      `Email: ${form.email}`,
      "Please confirm availability and final price.",
    ].filter(Boolean);
    return `https://wa.me/${BRAND.whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;
  }, [reference, subject, form]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setStatus("sending");
    const payload: RideRequestInput = {
      service,
      subject,
      category,
      priceRange,
      city: form.city,
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      startDate: form.startDate,
      endDate: service === "car" ? form.endDate : undefined,
      route: service === "jet" ? form.route.trim() || undefined : undefined,
      passengers: service !== "car" ? form.passengers.trim() || undefined : undefined,
      note: form.note.trim() || undefined,
    };
    try {
      const res = await submitRideRequest(payload);
      if (!res.ok) {
        setError(res.error ?? "Something went wrong. Please try again.");
        setStatus("idle");
        return;
      }
      setReference(res.reference ?? "");
      setStatus("done");
    } catch {
      setError("Network error. Please try again.");
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <div className="gti-pop p-6 text-center sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fbe7b4]">
          <CheckCircle2 className="h-8 w-8 text-[#c98a00]" />
        </div>
        <h3 className="gti-display mt-4 text-2xl font-bold">Your request has been sent</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#6b655b]">
          GTi Rides will review your request and contact you shortly to confirm availability and
          final pricing.
        </p>
        {reference && (
          <p className="mt-3 text-xs font-semibold tracking-wider text-[#9a9388]">REF {reference}</p>
        )}
        <div className="mt-6 rounded-2xl border border-[#e7e0d2] bg-[#faf8f1] p-4 text-left text-sm">
          <p className="font-semibold">{subject}</p>
          <p className="mt-1 text-[#6b655b]">
            {form.city}
            {form.startDate ? ` · ${form.startDate}` : ""}
            {form.endDate ? ` → ${form.endDate}` : ""}
          </p>
        </div>
        <a href={whatsappHref} target="_blank" rel="noreferrer" className="gti-btn gti-btn-gold mt-5 w-full py-3 text-base">
          <MessageCircle className="h-5 w-5" />
          Continue on WhatsApp
        </a>
        {onClose && (
          <button type="button" onClick={onClose} className="mt-3 text-sm font-semibold text-[#6b655b] hover:text-[#1e1a17]">
            Done
          </button>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={variant === "modal" ? "p-5 sm:p-6" : "p-5 sm:p-7"}>
      <div className="mb-4 rounded-2xl border border-[#e7e0d2] bg-[#faf8f1] px-4 py-3">
        <p className="text-xs font-bold uppercase tracking-wider text-[#9a9388]">
          {category ?? (service === "jet" ? "Private jet charter" : service === "cruise" ? "Boat cruise" : "Your selection")}
        </p>
        <p className="mt-0.5 font-bold">{subject}</p>
        {priceRange && <p className="mt-0.5 text-sm text-[#c98a00]">{priceRange}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="gti-label">Full name</label>
          <input required className="gti-field" placeholder="e.g. Ada Obi" value={form.fullName} onChange={set("fullName")} />
        </div>
        <div>
          <label className="gti-label">Phone number</label>
          <input required type="tel" className="gti-field" placeholder="080..." value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="gti-label">Email address</label>
          <input required type="email" className="gti-field" placeholder="you@email.com" value={form.email} onChange={set("email")} />
        </div>

        <div>
          <label className="gti-label">{copy.cityLabel}</label>
          <select className="gti-field" value={form.city} onChange={set("city")}>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="gti-label">{copy.dateLabel}</label>
          <input required type="date" className="gti-field" value={form.startDate} onChange={set("startDate")} />
        </div>

        {service === "car" && (
          <div className="sm:col-span-2">
            <label className="gti-label">End date</label>
            <input type="date" className="gti-field" value={form.endDate} onChange={set("endDate")} />
          </div>
        )}

        {service === "jet" && (
          <div className="sm:col-span-2">
            <label className="gti-label">Route</label>
            <input className="gti-field" placeholder="e.g. Lagos → Abuja" value={form.route} onChange={set("route")} />
          </div>
        )}

        {service !== "car" && (
          <div className="sm:col-span-2">
            <label className="gti-label">{service === "jet" ? "Passengers" : "Number of guests"}</label>
            <input className="gti-field" placeholder="e.g. 6" value={form.passengers} onChange={set("passengers")} />
          </div>
        )}

        <div className="sm:col-span-2">
          <label className="gti-label">Any extra note (optional)</label>
          <textarea rows={2} className="gti-field resize-none" placeholder="Tell us anything that helps us serve you better." value={form.note} onChange={set("note")} />
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-[#c0392b]">{error}</p>}

      <p className="mt-4 text-xs leading-5 text-[#9a9388]">
        Availability and final price are confirmed by GTi Rides after your request. No payment now.
      </p>

      <button type="submit" disabled={status === "sending"} className="gti-btn gti-btn-gold mt-4 w-full py-3 text-base disabled:opacity-70">
        {status === "sending" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" /> Sending…
          </>
        ) : (
          <>
            {copy.cta} <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>
    </form>
  );
}
