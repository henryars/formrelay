"use client";

import { useActionState } from "react";

import { resetPasswordAction, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">New password</span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
          required
        />
      </label>
      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">{state.message}</p>
      ) : null}
      <button type="submit" className="button-primary w-full justify-center" disabled={pending}>
        {pending ? "Saving..." : "Save new password"}
      </button>
    </form>
  );
}
