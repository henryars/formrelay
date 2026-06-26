"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { Search, MapPin, ChevronRight, X, ShieldCheck, Clock, Car as CarIcon } from "lucide-react";

import { CITIES } from "../_data/config";
import {
  CARS,
  CATEGORY_ORDER,
  type Car,
  type CarCategory,
  priceRangeLabel,
} from "../_data/fleet";
import { RequestForm } from "./RequestForm";

const CITY_OPTIONS = ["All cities", ...CITIES.filter((c) => c !== "Other")];
const AVAIL_STYLE: Record<Car["availability"], { bg: string; color: string }> = {
  Available: { bg: "#e7f6ec", color: "#1c7a3e" },
  Limited: { bg: "#fdf0d6", color: "#a9740b" },
  "On Request": { bg: "#efe9e0", color: "#6b655b" },
};

export function BrowseClient() {
  const [city, setCity] = useState("All cities");
  const [category, setCategory] = useState<CarCategory | "All">("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Car | null>(null);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CARS.filter((car) => {
      if (city !== "All cities" && !car.cities.includes(city)) return false;
      if (category !== "All" && car.category !== category) return false;
      if (q) {
        const hay = `${car.name} ${car.category} ${car.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [city, category, query]);

  const countFor = (cat: CarCategory | "All") =>
    CARS.filter((c) => {
      if (city !== "All cities" && !c.cities.includes(city)) return false;
      if (cat !== "All" && c.category !== cat) return false;
      return true;
    }).length;

  const scrollToFleet = () => {
    document.getElementById("fleet")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1e1a17] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 85% 15%, #f5b301 0, transparent 38%), radial-gradient(circle at 10% 90%, #f5b301 0, transparent 32%)",
          }}
        />
        <div className="relative mx-auto w-full max-w-[1180px] px-5 py-14 md:px-8 md:py-20">
          <span className="gti-chip" style={{ background: "rgba(245,179,1,0.14)", borderColor: "rgba(245,179,1,0.35)", color: "#f5b301" }}>
            ✦ Connecting Dreams
          </span>
          <h1 className="gti-display mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl">
            Find and request a ride in <span className="text-[#f5b301]">minutes</span>.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-[#cfc9bd] md:text-lg">
            Select your city, choose the type of car you want, and send a request to GTi Rides. No
            chat first, no payment now.
          </p>

          {/* Search card */}
          <div className="mt-8 rounded-3xl border border-white/10 bg-white p-3 shadow-2xl sm:flex sm:items-center sm:gap-2">
            <div className="relative flex-1">
              <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a9388]" />
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full appearance-none rounded-2xl bg-transparent py-3 pl-12 pr-4 font-semibold text-[#1e1a17] outline-none"
              >
                {CITY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 border-t border-[#e7e0d2] sm:border-l sm:border-t-0">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9a9388]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Prado, Camry, SUV, Tesla…"
                className="w-full rounded-2xl bg-transparent py-3 pl-12 pr-4 text-[#1e1a17] outline-none placeholder:text-[#a8a194]"
              />
            </div>
            <button onClick={scrollToFleet} className="gti-btn gti-btn-gold mt-2 w-full py-3 sm:mt-0 sm:w-auto sm:px-6">
              View rides
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
            <span className="inline-flex items-center gap-2 text-[#cfc9bd]">
              <CarIcon className="h-4 w-4 text-[#f5b301]" /> 5,000+ vehicles
            </span>
            <span className="inline-flex items-center gap-2 text-[#cfc9bd]">
              <MapPin className="h-4 w-4 text-[#f5b301]" /> 12 cities nationwide
            </span>
            <span className="inline-flex items-center gap-2 text-[#cfc9bd]">
              <Clock className="h-4 w-4 text-[#f5b301]" /> 24/7 support
            </span>
            <span className="inline-flex items-center gap-2 text-[#cfc9bd]">
              <ShieldCheck className="h-4 w-4 text-[#f5b301]" /> Verified partners
            </span>
          </div>
        </div>
      </section>

      {/* Fleet */}
      <section id="fleet" className="mx-auto w-full max-w-[1180px] scroll-mt-20 px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="gti-display text-2xl font-bold md:text-3xl">Choose what you&apos;re looking for</h2>
            <p className="mt-1 text-sm text-[#6b655b]">
              {results.length} ride{results.length === 1 ? "" : "s"}
              {city !== "All cities" ? ` in ${city}` : " available"}
            </p>
          </div>
        </div>

        {/* Category chips */}
        <div className="gti-rail mt-5 flex gap-2 overflow-x-auto pb-1">
          {(["All", ...CATEGORY_ORDER] as const).map((cat) => (
            <button
              key={cat}
              className="gti-chip"
              data-active={category === cat}
              onClick={() => setCategory(cat)}
            >
              {cat}
              <span className="opacity-60">{countFor(cat)}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        {results.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-[#e7e0d2] py-16 text-center">
            <p className="font-semibold">No rides match that yet.</p>
            <p className="mt-1 text-sm text-[#6b655b]">Try another city or clear your search.</p>
            <button
              onClick={() => {
                setCity("All cities");
                setCategory("All");
                setQuery("");
              }}
              className="gti-btn gti-btn-ghost mt-4 px-5 py-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((car) => {
              const avail = AVAIL_STYLE[car.availability];
              return (
                <article key={car.id} className="gti-card gti-fade-up flex flex-col">
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f1ece0]">
                    <Image
                      src={car.image}
                      alt={car.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                      className="object-cover"
                    />
                    <span
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold"
                      style={{ background: avail.bg, color: avail.color }}
                    >
                      {car.availability}
                    </span>
                    <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {car.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="gti-display text-lg font-bold">{car.name}</h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-[#6b655b]">
                      <MapPin className="h-3.5 w-3.5" /> {car.cities.join(" · ")}
                    </p>
                    <p className="mt-2 text-sm font-bold text-[#c98a00]">{priceRangeLabel(car)}</p>
                    <p className="mt-1.5 flex-1 text-sm leading-6 text-[#6b655b]">{car.note}</p>
                    <button
                      onClick={() => setSelected(car)}
                      className="gti-btn gti-btn-dark mt-4 w-full py-2.5 text-sm"
                    >
                      Request this ride
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Request modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="gti-pop relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e7e0d2] bg-white/95 px-5 py-3 backdrop-blur">
              <p className="gti-display font-bold">Request this ride</p>
              <button
                onClick={() => setSelected(null)}
                aria-label="Close"
                className="gti-btn gti-btn-ghost h-9 w-9 p-0"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <RequestForm
              service="car"
              subject={selected.name}
              category={selected.category}
              priceRange={priceRangeLabel(selected)}
              defaultCity={city !== "All cities" ? city : selected.cities[0]}
              cities={CITIES.filter((c) => c !== "Other")}
              variant="modal"
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      )}
    </>
  );
}
