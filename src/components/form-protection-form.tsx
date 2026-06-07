"use client";

import { useActionState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { updateFormProtectionSettingsAction, type EntityFormState } from "@/app/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

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

export function FormProtectionForm({ formId, defaults }: FormProtectionFormProps) {
  const [state, formAction, pending] = useActionState(updateFormProtectionSettingsAction, initialState);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="formId" value={formId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="spamProtectionLevel">Spam protection</Label>
          <select
            id="spamProtectionLevel"
            name="spamProtectionLevel"
            defaultValue={defaults.spamProtectionLevel}
            className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
          >
            <option value="RELAXED">Relaxed</option>
            <option value="STANDARD">Standard (recommended)</option>
            <option value="STRICT">Strict</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="websiteProtectionMode">Website protection</Label>
          <select
            id="websiteProtectionMode"
            name="websiteProtectionMode"
            defaultValue={defaults.websiteProtectionMode}
            className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
          >
            <option value="OPEN">Open</option>
            <option value="STANDARD">Standard</option>
            <option value="STRICT">Strict</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="formType">Form type</Label>
          <select
            id="formType"
            name="formType"
            defaultValue={defaults.formType}
            className="flex h-9 w-full rounded-md border border-[#e4e4e7] bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0098f2]"
          >
            <option value="CONTACT">Contact form</option>
            <option value="QUOTE_REQUEST">Quote request</option>
            <option value="NEWSLETTER">Newsletter</option>
            <option value="BOOKING_ENQUIRY">Booking enquiry</option>
            <option value="WAITLIST">Waitlist</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="honeypotFieldName">Honeypot field name</Label>
          <Input
            id="honeypotFieldName"
            name="honeypotFieldName"
            defaultValue={defaults.honeypotFieldName ?? ""}
            placeholder="_hp_formrelay"
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <p className="text-sm font-medium text-[#09090b]">Email notifications</p>
        {[
          { name: "notifyOnLowSuspicious", label: "Low suspicious submissions", value: defaults.notifyOnLowSuspicious },
          { name: "notifyOnSuspicious", label: "High suspicious submissions", value: defaults.notifyOnSuspicious },
          { name: "notifyOnSpam", label: "Spam submissions", value: defaults.notifyOnSpam },
          { name: "weeklySpamSummary", label: "Weekly spam digest", value: defaults.weeklySpamSummary },
        ].map((field) => (
          <div key={field.name} className="flex items-center justify-between">
            <Label htmlFor={field.name} className="cursor-pointer font-normal text-[#52525b]">
              Notify on {field.label.toLowerCase()}
            </Label>
            <div className="flex items-center gap-2">
              <input type="hidden" name={field.name} value="false" />
              <Switch
                id={field.name}
                name={field.name}
                defaultChecked={field.value}
                value="true"
              />
            </div>
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
        {pending ? "Saving…" : "Save protection settings"}
      </Button>
    </form>
  );
}
