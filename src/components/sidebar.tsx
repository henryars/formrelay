"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  FileText,
  Inbox,
  ShieldAlert,
  Settings,
  Zap,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",             icon: LayoutDashboard, label: "Overview"  },
  { href: "/dashboard/websites",    icon: Globe,           label: "Websites"  },
  { href: "/dashboard/forms",       icon: FileText,        label: "Forms"     },
  { href: "/dashboard/submissions", icon: Inbox,           label: "Inbox"     },
  { href: "/dashboard/spam",        icon: ShieldAlert,     label: "Spam"      },
];

const bottomNavItems = [
  { href: "/dashboard",             icon: LayoutDashboard, label: "Home"  },
  { href: "/dashboard/forms",       icon: FileText,        label: "Forms" },
  { href: "/dashboard/submissions", icon: Inbox,           label: "Inbox" },
  { href: "/dashboard/spam",        icon: ShieldAlert,     label: "Spam"  },
];

interface SidebarProps {
  workspaceName: string;
  userEmail: string;
  onboardingComplete: boolean;
  setupProgress?: number;
}

export function Sidebar({
  workspaceName,
  userEmail,
  onboardingComplete,
  setupProgress = 0,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[220px] flex-col bg-[#09090b] md:flex">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 px-5 border-b border-[#27272a]">
          <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-white/10">
            <Zap className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-sm font-bold text-white">FormRelay</span>
        </div>

        {/* Workspace name */}
        <div className="px-4 py-3 border-b border-[#27272a]">
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#71717a]">Workspace</p>
          <p className="mt-0.5 text-sm font-semibold text-white truncate">{workspaceName}</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? "#27272a" : "transparent",
                  color: active ? "#ffffff" : "#d4d4d8",
                }}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Setup progress (if onboarding incomplete) */}
        {!onboardingComplete && (
          <div className="mx-3 mb-3 rounded-[12px] bg-[#1c1c1f] p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-white">Setup</p>
              <p className="text-xs text-[#a1a1aa]">{setupProgress}/3</p>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[#3f3f46] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0098f2] transition-all"
                style={{ width: `${(setupProgress / 3) * 100}%` }}
              />
            </div>
            <Link
              href="/dashboard/onboarding"
              className="mt-2 block text-xs text-[#0098f2] hover:text-[#38b2f5] transition-colors"
            >
              Continue setup →
            </Link>
          </div>
        )}

        {/* Settings + User */}
        <div className="border-t border-[#27272a] px-3 py-3 space-y-0.5">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: pathname.startsWith("/dashboard/settings") ? "#27272a" : "transparent",
              color: pathname.startsWith("/dashboard/settings") ? "#ffffff" : "#d4d4d8",
            }}
          >
            <Settings className="h-4 w-4 shrink-0" />
            Settings
          </Link>
          <div className="flex items-center justify-between gap-2 px-3 py-2">
            <p className="text-xs truncate" style={{ color: "#a1a1aa" }}>{userEmail}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="transition-colors"
                style={{ color: "#a1a1aa" }}
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-[#ececee] bg-white/95 backdrop-blur px-5 md:hidden">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[10px] bg-[#09090b]">
            <Zap className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-sm font-bold text-[#09090b]">FormRelay</span>
        </div>
        <form action={logoutAction}>
          <button type="submit" className="p-2 text-[#a1a1aa] hover:text-[#09090b]">
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </header>

      {/* ── Mobile bottom navigation ── */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-[#ececee] bg-white/95 backdrop-blur md:hidden">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                active ? "text-[#09090b]" : "text-[#a1a1aa]"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-[#09090b]" : "text-[#a1a1aa]")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
