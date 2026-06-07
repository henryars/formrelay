"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  FileText,
  Inbox,
  ShieldAlert,
  Lock,
  Settings,
  CreditCard,
  Zap,
  ChevronRight,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SidebarLogout } from "./sidebar-logout";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/websites", label: "Websites", icon: Globe },
  { href: "/dashboard/forms", label: "Forms", icon: FileText },
  { href: "/dashboard/submissions", label: "Submissions", icon: Inbox },
  { href: "/dashboard/spam", label: "Spam", icon: ShieldAlert },
  { href: "/dashboard/security", label: "Security", icon: Lock },
];

const bottomItems = [
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
];

type SidebarProps = {
  workspaceName: string;
  userEmail: string;
  onboardingComplete: boolean;
};

export function Sidebar({ workspaceName, userEmail, onboardingComplete }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const sidebarInner = (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#0098f2]">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">FormRelay</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white md:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Workspace */}
      <div className="px-4 py-3 border-b border-white/10">
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-1">Workspace</p>
        <p className="text-sm font-medium text-white truncate">{workspaceName}</p>
      </div>

      {/* Onboarding nudge */}
      {!onboardingComplete && (
        <Link
          href="/dashboard/onboarding"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "mx-3 mt-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
            isActive("/dashboard/onboarding")
              ? "bg-[#0098f2] text-white"
              : "bg-[#0098f2]/15 text-[#0098f2] hover:bg-[#0098f2]/25"
          )}
        >
          <Rocket className="h-3.5 w-3.5 shrink-0" />
          <span>Complete setup</span>
          <ChevronRight className="ml-auto h-3 w-3" />
        </Link>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-white/10 px-3 py-3 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="mt-2 border-t border-white/10 pt-3">
          <div className="px-3 mb-1">
            <p className="text-xs text-white/40 truncate">{userEmail}</p>
          </div>
          <SidebarLogout />
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="fixed top-0 left-0 right-0 z-20 flex h-14 items-center justify-between border-b border-[#e4e4e7] bg-white px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-sm text-[#09090b]">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-[#0098f2]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </div>
          FormRelay
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#71717a] hover:bg-[#f4f4f5] transition-colors"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#111111] text-white transition-transform duration-200 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {sidebarInner}
      </aside>
    </>
  );
}
