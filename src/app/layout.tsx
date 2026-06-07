import type { Metadata } from "next";
import Link from "next/link";

import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

export const metadata: Metadata = {
  title: "FormRelay",
  description: "Universal form backend for static, no-code, and AI-built websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userPromise = getCurrentUser();

  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full bg-cool-mist text-midnight-ink">
        <div className="flex min-h-full flex-col">
          <header className="sticky top-0 z-20 bg-white/90 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-6 md:px-8">
              <Link href="/" className="text-xl font-semibold tracking-[-0.03em] text-onyx-button">
                FormRelay
              </Link>

              <nav className="hidden items-center gap-8 text-sm font-medium text-midnight-ink md:flex">
                <Link href="/#how-it-works">How it works</Link>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/docs">Docs</Link>
                <Link href="/pricing">Pricing</Link>
              </nav>

              <div className="flex items-center gap-4">
                <AuthActions userPromise={userPromise} />
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}

async function AuthActions({
  userPromise,
}: {
  userPromise: ReturnType<typeof getCurrentUser>;
}) {
  const user = await userPromise;

  if (user) {
    return (
      <>
        <Link href="/dashboard" className="hidden text-sm font-medium text-midnight-ink sm:inline-flex">
          Dashboard
        </Link>
        <LogoutButton />
      </>
    );
  }

  return (
    <>
      <Link href="/login" className="hidden text-sm font-medium text-midnight-ink sm:inline-flex">
        Log in
      </Link>
      <Link href="/signup" className="button-primary">
        Start free
      </Link>
    </>
  );
}
