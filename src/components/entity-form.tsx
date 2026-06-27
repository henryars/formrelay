"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, normalizeUrl } from "@/lib/utils";

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
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      placeholder?: string;
      hint?: string;
      kind: "textarea";
      required?: boolean;
      optional?: boolean;
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      options: Option[];
      hint?: string;
      kind: "select";
      required?: boolean;
      optional?: boolean;
      defaultValue?: string;
    }
  | {
      name: string;
      label: string;
      options: Option[];
      hint?: string;
      kind: "combobox";
      placeholder?: string;
      required?: boolean;
      optional?: boolean;
      defaultValue?: string;
    };

type EntityFormProps = {
  action: (state: EntityFormState, formData: FormData) => Promise<EntityFormState>;
  submitLabel: string;
  fields: Field[];
  hiddenFields?: Record<string, string>;
};

function Combobox({
  name,
  options,
  defaultValue,
  placeholder,
}: {
  name: string;
  options: Option[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const initialLabel = options.find((o) => o.value === defaultValue)?.label ?? defaultValue ?? "";
  const [query, setQuery] = useState(initialLabel);
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = query
    ? options.filter(
        (o) =>
          o.label.toLowerCase().includes(query.toLowerCase()) ||
          o.value.toLowerCase().includes(query.toLowerCase()),
      )
    : options;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <Input
          value={query}
          placeholder={placeholder ?? "Search…"}
          onChange={(e) => {
            setQuery(e.target.value);
            setValue(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          className="pr-8"
          autoComplete="off"
        />
        <ChevronDown
          className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1aa] pointer-events-none"
        />
      </div>
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-[#e4e4e7] bg-white shadow-md text-sm">
          {filtered.slice(0, 100).map((o) => (
            <li
              key={o.value}
              className={cn(
                "cursor-pointer px-3 py-2 hover:bg-[#f4f4f5]",
                o.value === value && "bg-[#f0f0f0] font-medium",
              )}
              onMouseDown={(e) => {
                e.preventDefault();
                setValue(o.value);
                setQuery(o.label);
                setOpen(false);
              }}
            >
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const initialState: EntityFormState = {};

export function EntityForm({ action, submitLabel, fields, hiddenFields }: EntityFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}

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
              defaultValue={field.defaultValue}
            />
          )}

          {field.kind === "select" && (
            <select
              id={field.name}
              name={field.name}
              className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
              defaultValue={field.defaultValue ?? field.options[0]?.value}
            >
              {field.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}

          {field.kind === "combobox" && (
            <Combobox
              name={field.name}
              options={field.options}
              defaultValue={field.defaultValue}
              placeholder={field.placeholder}
            />
          )}

          {(!field.kind || field.kind === "input") && (
            <Input
              id={field.name}
              name={field.name}
              type={(field as { type?: string }).type === "url" ? "text" : (field as { type?: string }).type ?? "text"}
              inputMode={(field as { type?: string }).type === "url" ? "url" : undefined}
              onBlur={
                (field as { type?: string }).type === "url"
                  ? (e) => {
                      e.currentTarget.value = normalizeUrl(e.currentTarget.value);
                    }
                  : undefined
              }
              placeholder={(field as { placeholder?: string }).placeholder}
              defaultValue={field.defaultValue}
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
