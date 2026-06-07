"use client";

import { useActionState } from "react";

import {
  updateFormProtectionSettingsAction,
  type EntityFormState,
} from "@/app/actions/forms";

const initialState: EntityFormState = {};

type FormProtectionFormProps = {
  formId: string;
  defaults: {
    spamProtectionLevel: string;
    websiteProtectionMode: string;
    formType: string;
    honeypotFieldName?: string | null;
    notifyOnLowSuspicious: boolean;
    notifyOnSuspicious: boolean;
    notifyOnSpam: boolean;
    weeklySpamSummary: boolean;
  };
};

export function FormProtectionForm({
  formId,
  defaults,
}: FormProtectionFormProps) {
  const [state, formAction, pending] = useActionState(
    updateFormProtectionSettingsAction,
    initialState,
  );

  const booleanOptions = [
    { label: "On", value: "true" },
    { label: "Off", value: "false" },
  ];

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="formId" value={formId} />

      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Spam protection level</span>
        <select
          name="spamProtectionLevel"
          defaultValue={defaults.spamProtectionLevel}
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
        >
          <option value="RELAXED">Relaxed</option>
          <option value="STANDARD">Standard</option>
          <option value="STRICT">Strict</option>
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Website protection</span>
        <select
          name="websiteProtectionMode"
          defaultValue={defaults.websiteProtectionMode}
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
        >
          <option value="OPEN">Open</option>
          <option value="STANDARD">Standard</option>
          <option value="STRICT">Strict</option>
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Form type</span>
        <select
          name="formType"
          defaultValue={defaults.formType}
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
        >
          <option value="CONTACT">Contact form</option>
          <option value="QUOTE_REQUEST">Quote request</option>
          <option value="NEWSLETTER">Newsletter</option>
          <option value="BOOKING_ENQUIRY">Booking enquiry</option>
          <option value="WAITLIST">Waitlist</option>
          <option value="OTHER">Other</option>
        </select>
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-midnight-ink">Honeypot field name</span>
        <input
          name="honeypotFieldName"
          type="text"
          defaultValue={defaults.honeypotFieldName ?? ""}
          placeholder="_hp_formrelay123"
          className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
        />
      </label>

      {[
        {
          name: "notifyOnLowSuspicious",
          label: "Notify me for low suspicious submissions",
          value: defaults.notifyOnLowSuspicious,
        },
        {
          name: "notifyOnSuspicious",
          label: "Notify me for high suspicious submissions",
          value: defaults.notifyOnSuspicious,
        },
        {
          name: "notifyOnSpam",
          label: "Notify me for spam submissions",
          value: defaults.notifyOnSpam,
        },
        {
          name: "weeklySpamSummary",
          label: "Send weekly spam summary",
          value: defaults.weeklySpamSummary,
        },
      ].map((field) => (
        <label key={field.name} className="block space-y-2">
          <span className="text-sm font-medium text-midnight-ink">{field.label}</span>
          <select
            name={field.name}
            defaultValue={field.value ? "true" : "false"}
            className="w-full rounded-xl border border-stone-edge/40 bg-white px-4 py-3 text-midnight-ink outline-none transition focus:border-invoice-blue"
          >
            {booleanOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      ))}

      {state.error ? (
        <p className="rounded-xl bg-wash-petal px-4 py-3 text-sm text-midnight-ink">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="rounded-xl bg-wash-sky px-4 py-3 text-sm text-midnight-ink">
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="button-primary justify-center" disabled={pending}>
        {pending ? "Saving..." : "Save protection settings"}
      </button>
    </form>
  );
}
