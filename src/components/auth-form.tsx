"use client";

import { useActionState } from "react";

import type { AuthFormState } from "@/app/actions/auth";

type AuthFormProps = {
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>;
  submitLabel: string;
  fields: Array<{
    name: string;
    label: string;
    type?: string;
    autoComplete?: string;
  }>;
};

const initialState: AuthFormState = {};

export function AuthForm({ action, submitLabel, fields }: AuthFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {fields.map((field) => (
        <label key={field.name} className="block space-y-2">
          <span className="text-sm font-medium text-midnight-ink">{field.label}</span>
          <input
            name={field.name}
            type={field.type ?? "text"}
            autoComplete={field.autoComplete}
            className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
            required
          />
        </label>
      ))}

      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">{state.message}</p>
      ) : null}

      <button type="submit" className="button-primary w-full justify-center" disabled={pending}>
        {pending ? "Working..." : submitLabel}
      </button>
    </form>
  );
}
