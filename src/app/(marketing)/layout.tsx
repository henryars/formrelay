import Link from "next/link";
import { Zap } from "lucide-react";
import { LogoutButton } from "@/components/logout-button";
import { MobileMenu } from "@/components/mobile-menu";
import { getCurrentUser } from "@/lib/auth";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const isLoggedIn = !!user;

  return (
    <div className="flex min-h-full flex-col bg-[#f4f4f5] text-[#18181b]">
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#ececee]">
        <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-4 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-bold tracking-[-0.03em] text-[#09090b]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#09090b]">
              <Zap className="h-4 w-4 text-white" />
            </span>
            FormRelay
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#3f3f46] md:flex">
            <Link href="/#how-it-works" className="hover:text-[#09090b] transition-colors">
              How it works
            </Link>
            <Link href="/pricing" className="hover:text-[#09090b] transition-colors">
              Pricing
            </Link>
            <Link href="/builders" className="hover:text-[#09090b] transition-colors">
              For builders
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden text-sm font-medium text-[#3f3f46] sm:inline-flex hover:text-[#09090b] transition-colors"
                >
                  Dashboard
                </Link>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-sm font-medium text-[#3f3f46] sm:inline-flex hover:text-[#09090b] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="hidden sm:inline-flex items-center gap-2 rounded-full bg-[#09090b] px-5 py-2.5 text-sm font-medium text-white"
                  style={{
                    boxShadow:
                      "rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px",
                  }}
                >
                  Start free
                </Link>
              </>
            )}
            <MobileMenu isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </header>

      {children}

      <footer className="border-t border-[#ececee] bg-white">
        <div className="mx-auto max-w-[1200px] px-6 py-12 md:px-8">
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#09090b]">
                  <Zap className="h-4 w-4 text-white" />
                </span>
                <span className="font-bold text-[#09090b]">FormRelay</span>
              </Link>
              <p className="mt-3 text-sm leading-6 text-[#71717a] max-w-[200px]">
                The form backend for modern websites. No server required.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-4">
                Product
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "How it works", href: "/#how-it-works" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "For builders", href: "/builders" },
                  { label: "Dashboard", href: "/dashboard" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#52525b] hover:text-[#0098f2] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-4">
                Works with
              </p>
              <ul className="space-y-3 text-sm text-[#71717a]">
                {["Webflow", "Framer", "Lovable", "React / Next.js", "Plain HTML"].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa] mb-4">
                Account
              </p>
              <ul className="space-y-3 text-sm">
                {[
                  { label: "Create account", href: "/signup" },
                  { label: "Log in", href: "/login" },
                  { label: "Forgot password", href: "/forgot-password" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#52525b] hover:text-[#0098f2] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-[#ececee] pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-sm text-[#a1a1aa]">© 2026 FormRelay. All rights reserved.</p>
            <div className="flex gap-6 text-sm text-[#a1a1aa]">
              <Link href="#" className="hover:text-[#0098f2] transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-[#0098f2] transition-colors">Terms</Link>
              <a href="#" className="hover:text-[#0098f2] transition-colors">Need help?</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
