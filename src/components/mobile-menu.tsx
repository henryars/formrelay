"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";

export function MobileMenu({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#1e1e1e] hover:bg-[#f4f4f4] transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col bg-snow">
          <div className="flex items-center justify-between border-b border-[#f0f0f0] px-6 py-5">
            <Link
              href="/"
              className="flex items-center gap-2 font-semibold text-[#0d111b]"
              onClick={() => setOpen(false)}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0098f2]">
                <Zap className="h-4 w-4 text-white" />
              </span>
              FormRelay
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-[#f4f4f4] transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-1 p-4 flex-1">
            {[
              { href: "/#how-it-works", label: "How it works" },
              { href: "/pricing", label: "Pricing" },
              { href: "/docs", label: "Docs" },
              ...(isLoggedIn
                ? [{ href: "/dashboard", label: "Dashboard" }]
                : [{ href: "/login", label: "Log in" }]),
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3.5 text-lg font-medium text-[#1e1e1e] hover:bg-[#f7f8fa] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {!isLoggedIn && (
            <div className="border-t border-[#f0f0f0] p-6">
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="button-primary w-full justify-center"
              >
                Start free — no credit card
              </Link>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
