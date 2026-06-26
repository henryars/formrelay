"use client";

import Image from "next/image";
import { Check } from "lucide-react";

import { CITIES, type ServiceKind } from "../_data/config";
import { RequestForm } from "./RequestForm";

type Props = {
  service: Extract<ServiceKind, "jet" | "cruise">;
  eyebrow: string;
  title: string;
  subtitle: string;
  image: string;
  priceNote: string;
  features: string[];
  subject: string;
};

export function ServiceClient({
  service,
  eyebrow,
  title,
  subtitle,
  image,
  priceNote,
  features,
  subject,
}: Props) {
  return (
    <>
      {/* Hero image */}
      <section className="relative">
        <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden md:h-[52vh]">
          <Image src={image} alt={title} fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1a17] via-[#1e1a17]/45 to-[#1e1a17]/10" />
          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-[1180px] px-5 pb-8 md:px-8 md:pb-12">
              <span className="gti-chip" style={{ background: "rgba(245,179,1,0.16)", borderColor: "rgba(245,179,1,0.4)", color: "#f5b301" }}>
                {eyebrow}
              </span>
              <h1 className="gti-display mt-4 max-w-2xl text-4xl font-extrabold leading-[1.05] text-white md:text-5xl">
                {title}
              </h1>
              <p className="mt-3 max-w-xl text-[#e7e0d2] md:text-lg">{subtitle}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto grid w-full max-w-[1180px] gap-8 px-5 py-12 md:grid-cols-[1fr_minmax(380px,460px)] md:px-8 md:py-16">
        <div>
          <h2 className="gti-display text-2xl font-bold">What&apos;s included</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 rounded-2xl border border-[#e7e0d2] bg-white p-4">
                <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[#fbe7b4]">
                  <Check className="h-4 w-4 text-[#c98a00]" />
                </span>
                <span className="text-sm leading-6 text-[#3f3a34]">{f}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 rounded-2xl border border-[#e7e0d2] bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-[#9a9388]">Indicative pricing</p>
            <p className="mt-1 text-lg font-bold text-[#c98a00]">{priceNote}</p>
            <p className="mt-1 text-sm text-[#6b655b]">
              Final quote is confirmed by GTi Rides after your request, based on date, duration and
              route.
            </p>
          </div>
        </div>

        {/* Request card */}
        <div className="md:sticky md:top-24">
          <div className="gti-card overflow-visible">
            <RequestForm
              service={service}
              subject={subject}
              cities={CITIES.filter((c) => c !== "Other")}
              variant="inline"
            />
          </div>
        </div>
      </section>
    </>
  );
}
