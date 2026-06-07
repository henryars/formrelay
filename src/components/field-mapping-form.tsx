"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateFieldMappingAction, type EntityFormState } from "@/app/actions/forms";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const initialState: EntityFormState = {};

type Option = { label: string; value: string };

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
    { name: "nameFieldKey", label: "Name field", defaultValue: defaults.nameFieldKey ?? "" },
    { name: "emailFieldKey", label: "Email field", defaultValue: defaults.emailFieldKey ?? "" },
    { name: "phoneFieldKey", label: "Phone field", defaultValue: defaults.phoneFieldKey ?? "" },
    { name: "messageFieldKey", label: "Message field", defaultValue: defaults.messageFieldKey ?? "" },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <Label htmlFor={field.name}>{field.label}</Label>
            <select
              id={field.name}
              name={field.name}
              defaultValue={field.defaultValue}
              className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
            >
              <option value="">Not mapped</option>
              {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {state.error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm text-red-700">{state.error}</p>
        </div>
      )}
      {state.message && (
        <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3">
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <p className="text-sm text-green-700">{state.message}</p>
        </div>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save mapping"}
      </Button>
    </form>
  );
}
