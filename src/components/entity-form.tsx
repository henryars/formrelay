"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
      hint?: string;
      kind?: "input";
      required?: boolean;
      optional?: boolean;
    }
  | {
      name: string;
      label: string;
      placeholder?: string;
      hint?: string;
      kind: "textarea";
      required?: boolean;
      optional?: boolean;
    }
  | {
      name: string;
      label: string;
      options: Option[];
      hint?: string;
      kind: "select";
      required?: boolean;
      optional?: boolean;
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
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label htmlFor={field.name} className="flex items-center gap-1.5">
            {field.label}
            {(field as { optional?: boolean }).optional && (
              <span className="text-xs font-normal text-[#a1a1aa]">(optional)</span>
            )}
          </Label>

          {field.kind === "textarea" && (
            <Textarea
              id={field.name}
              name={field.name}
              rows={4}
              placeholder={field.placeholder}
            />
          )}

          {field.kind === "select" && (
            <select
              id={field.name}
              name={field.name}
              className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
              defaultValue={field.options[0]?.value}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {(!field.kind || field.kind === "input") && (
            <Input
              id={field.name}
              name={field.name}
              type={(field as { type?: string }).type ?? "text"}
              placeholder={(field as { placeholder?: string }).placeholder}
              required={
                !(field as { optional?: boolean }).optional &&
                (field as { required?: boolean }).required !== false &&
                field.name !== "allowedDomains" &&
                field.name !== "defaultSuccessRedirect" &&
                field.name !== "successRedirectUrl" &&
                field.name !== "timezone"
              }
            />
          )}

          {(field as { hint?: string }).hint && (
            <p className="text-xs text-[#a1a1aa]">{(field as { hint?: string }).hint}</p>
          )}
        </div>
      ))}

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

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
