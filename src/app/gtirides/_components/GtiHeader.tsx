"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";

import { BRAND } from "../_data/config";

const NAV = [
  { label: "Cars", href: "/gtirides" },
  { label: "Private Jets", href: "/gtirides/jets" },
  { label: "Boat Cruises", href: "/gtirides/cruises" },
];

export function GtiHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/gtirides" ? pathname === "/gtirides" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-[#e7e0d2] bg-[#faf8f1]/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-5 py-3 md:px-8">
        <Link href="/gtirides" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <Image
            src="/gtirides/logo.png"
            alt="GTi Rides"
            width={132}
            height={108}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
              style={{
                color: isActive(item.href) ? "#1e1a17" : "#6b655b",
                background: isActive(item.href) ? "#f1ece0" : "transparent",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={BRAND.whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="gti-btn gti-btn-gold hidden px-4 py-2 text-sm sm:inline-flex"
          >
            <Phone className="h-4 w-4" />
            Talk to us
          </a>
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setOpen((v) => !v)}
            className="gti-btn gti-btn-ghost h-10 w-10 p-0 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="gti-pop border-t border-[#e7e0d2] bg-[#faf8f1] px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold"
                style={{
                  color: isActive(item.href) ? "#1e1a17" : "#4a443c",
                  background: isActive(item.href) ? "#f1ece0" : "transparent",
                }}
              >
                {item.label}
              </Link>
            ))}
            <a
              href={BRAND.whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="gti-btn gti-btn-gold mt-2 py-3 text-base"
            >
              <Phone className="h-4 w-4" />
              Talk to us on WhatsApp
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
