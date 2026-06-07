"use client";

import { useActionState } from "react";

import { updateFieldMappingAction, type EntityFormState } from "@/app/actions/forms";

const initialState: EntityFormState = {};

type Option = {
  label: string;
  value: string;
};

export function FieldMappingForm({
  formId,
  options,
  defaults,
}: {
  formId: string;
  options: Option[];
  defaults: {
    nameFieldKey?: string | null;
    emailFieldKey?: string | null;
    phoneFieldKey?: string | null;
    messageFieldKey?: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(updateFieldMappingAction, initialState);

  const fields = [
    { name: "nameFieldKey", label: "Customer name field", defaultValue: defaults.nameFieldKey ?? "" },
    { name: "emailFieldKey", label: "Customer email field", defaultValue: defaults.emailFieldKey ?? "" },
    { name: "phoneFieldKey", label: "Customer phone field", defaultValue: defaults.phoneFieldKey ?? "" },
    { name: "messageFieldKey", label: "Main message field", defaultValue: defaults.messageFieldKey ?? "" },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />

      {fields.map((field) => (
        <label key={field.name} className="block space-y-2">
          <span className="text-sm font-medium text-midnight-ink">{field.label}</span>
          <select
            name={field.name}
            defaultValue={field.defaultValue}
            className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
          >
            <option value="">Not mapped yet</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">{state.message}</p>
      ) : null}

      <button type="submit" className="button-primary justify-center" disabled={pending}>
        {pending ? "Saving..." : "Save mapping"}
      </button>
    </form>
  );
}
