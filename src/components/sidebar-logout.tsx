"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { logOutAction } from "@/app/actions/auth";

export function SidebarLogout() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => logOutAction())}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors disabled:opacity-50"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
