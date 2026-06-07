"use client";

import { useActionState } from "react";

import { updateAccountSettingsAction, type AuthFormState } from "@/app/actions/auth";

const initialState: AuthFormState = {};

export function AccountSettingsForm({
  fullName,
  workspaceName,
  email,
}: {
  fullName: string;
  workspaceName: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState(updateAccountSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Full name</span>
        <input
          name="fullName"
          defaultValue={fullName}
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Workspace name</span>
        <input
          name="workspaceName"
          defaultValue={workspaceName}
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none"
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Email</span>
        <input
          value={email}
          disabled
          className="w-full rounded-xl border border-stone-edge/40 bg-cool-mist px-4 py-3 text-graphite-mute outline-none"
        />
      </label>
      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">{state.message}</p>
      ) : null}
      <button type="submit" className="button-primary" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}
