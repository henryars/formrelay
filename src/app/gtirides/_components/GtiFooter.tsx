import Image from "next/image";
import Link from "next/link";

import { BRAND, CITIES } from "../_data/config";

export function GtiFooter() {
  return (
    <footer className="mt-20 bg-[#1e1a17] text-[#cfc9bd]">
      <div className="mx-auto grid w-full max-w-[1180px] gap-10 px-5 py-14 md:grid-cols-4 md:px-8">
        <div className="md:col-span-2">
          <Image
            src="/gtirides/logo-footer.png"
            alt="GTi Rides"
            width={150}
            height={123}
            className="h-12 w-auto brightness-0 invert"
          />
          <p className="mt-4 max-w-xs text-sm leading-6 text-[#9a9388]">
            {BRAND.tagline}. Rent luxury cars, private jets and boat cruises across Nigeria — request
            in minutes, confirm on WhatsApp.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#7c766b]">Explore</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/gtirides" className="transition-colors hover:text-[#f5b301]">
                Cars
              </Link>
            </li>
            <li>
              <Link href="/gtirides/jets" className="transition-colors hover:text-[#f5b301]">
                Private Jets
              </Link>
            </li>
            <li>
              <Link href="/gtirides/cruises" className="transition-colors hover:text-[#f5b301]">
                Boat Cruises
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-[#7c766b]">Cities</p>
          <ul className="space-y-2 text-sm text-[#9a9388]">
            {CITIES.filter((c) => c !== "Other")
              .slice(0, 6)
              .map((city) => (
                <li key={city}>{city}</li>
              ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-2 px-5 py-5 text-xs text-[#7c766b] sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} GTi Rides. Prototype concept.</p>
          <p>Availability &amp; final pricing confirmed after your request.</p>
        </div>
      </div>
    </footer>
  );
}
