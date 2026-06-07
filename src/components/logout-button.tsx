"use client";

import { useTransition } from "react";

import { logOutAction } from "@/app/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => {
        startTransition(async () => {
          await logOutAction();
        });
      }}
      className="text-sm font-medium text-midnight-ink"
      disabled={pending}
    >
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}
