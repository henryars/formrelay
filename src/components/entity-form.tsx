"use client";

import { useActionState } from "react";

import type { EntityFormState } from "@/app/actions/forms";

type Option = {
  label: string;
  value: string;
};

type Field =
  | {
      name: string;
      label: string;
      type?: "text" | "email" | "url";
      placeholder?: string;
      kind?: "input";
    }
  | {
      name: string;
      label: string;
      placeholder?: string;
      kind: "textarea";
    }
  | {
      name: string;
      label: string;
      options: Option[];
      kind: "select";
    };

type EntityFormProps = {
  action: (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;
  submitLabel: string;
  fields: Field[];
};

const initialState: EntityFormState = {};

export function EntityForm({ action, submitLabel, fields }: EntityFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {fields.map((field) => {
        if (field.kind === "textarea") {
          return (
            <label key={field.name} className="block space-y-2">
              <span className="text-sm font-medium text-midnight-ink">{field.label}</span>
              <textarea
                name={field.name}
                rows={4}
                placeholder={field.placeholder}
                className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
              />
            </label>
          );
        }

        if (field.kind === "select") {
          return (
            <label key={field.name} className="block space-y-2">
              <span className="text-sm font-medium text-midnight-ink">{field.label}</span>
              <select
                name={field.name}
                className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
                defaultValue={field.options[0]?.value}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          );
        }

        return (
          <label key={field.name} className="block space-y-2">
            <span className="text-sm font-medium text-midnight-ink">{field.label}</span>
            <input
              name={field.name}
              type={field.type ?? "text"}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
              required={field.name !== "allowedDomains" && field.name !== "defaultSuccessRedirect"}
            />
          </label>
        );
      })}

      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">{state.message}</p>
      ) : null}

      <button type="submit" className="button-primary justify-center" disabled={pending}>
        {pending ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
