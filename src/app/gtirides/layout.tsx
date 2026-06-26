import type { Metadata } from "next";

import "./gti.css";
import { GtiHeader } from "./_components/GtiHeader";
import { GtiFooter } from "./_components/GtiFooter";

export const metadata: Metadata = {
  title: "GTi Rides — Rent your dream ride",
  description:
    "Find and request a ride in minutes. Luxury cars, private jets and boat cruises across Nigeria.",
};

export default function GtiLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="gti">
      {/* Brand fonts (runtime load keeps the prototype fully self-contained). */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap"
      />
      <GtiHeader />
      <main>{children}</main>
      <GtiFooter />
    </div>
  );
}
