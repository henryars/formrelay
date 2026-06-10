"use client";

import { useActionState, useState } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { createFormInboxAction } from "@/app/actions/forms";

type Website = { id: string; websiteName: string };

const INITIAL = { error: undefined, message: undefined };

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#09090b]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#71717a]">{hint}</p>}
    </div>
  );
}

export function NewFormClient({
  websites,
  defaultWebsiteId,
}: {
  websites: Website[];
  defaultWebsiteId?: string;
}) {
  const [state, action, pending] = useActionState(createFormInboxAction, INITIAL);
  const [advanced, setAdvanced] = useState(false);

  return (
    <div className="rounded-[24px] bg-white border border-[#ececee] p-6 space-y-5"
      style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}>
      <div>
        <h2 className="text-base font-bold text-[#09090b]">Form details</h2>
        <p className="text-sm text-[#71717a] mt-0.5">Fill in the basics — you can always change these later.</p>
      </div>

      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-[10px] bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
            {state.error}
          </p>
        )}

        {/* Website */}
        <FieldRow label="Website" hint="Which website will this form appear on?">
          <select
            name="websiteId"
            defaultValue={defaultWebsiteId ?? websites[0]?.id}
            className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] focus:ring-2 focus:ring-[#0098f2]/10 transition-colors"
          >
            {websites.map((w) => (
              <option key={w.id} value={w.id}>{w.websiteName}</option>
            ))}
          </select>
        </FieldRow>

        {/* Form name */}
        <FieldRow label="Form name" hint="e.g. Contact Form, Quote Request, Waitlist">
          <input
            name="formName"
            placeholder="Contact Form"
            required
            className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] focus:ring-2 focus:ring-[#0098f2]/10 placeholder:text-[#a1a1aa] transition-colors"
          />
        </FieldRow>

        {/* Recipient emails */}
        <FieldRow label="Recipient email(s)" hint="Comma-separated. You'll get an email every time someone submits.">
          <input
            name="recipientEmails"
            type="email"
            placeholder="hello@mysite.com"
            required
            className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] focus:ring-2 focus:ring-[#0098f2]/10 placeholder:text-[#a1a1aa] transition-colors"
          />
        </FieldRow>

        {/* ── Advanced ── */}
        <div className="rounded-[14px] border border-[#ececee] overflow-hidden">
          <button
            type="button"
            onClick={() => setAdvanced(!advanced)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#52525b] hover:bg-[#fafafa] transition-colors"
          >
            <span className="flex items-center gap-2">
              Advanced options
              <span className="text-xs text-[#a1a1aa] font-normal">spam protection, form type, redirect</span>
            </span>
            <ChevronDown className={`h-4 w-4 text-[#a1a1aa] transition-transform duration-200 ${advanced ? "rotate-180" : ""}`} />
          </button>

          {advanced && (
            <div className="border-t border-[#ececee] px-4 py-4 space-y-4 bg-[#fafafa]">
              <FieldRow label="Form type" hint="Categorises submissions in your inbox.">
                <select
                  name="formType"
                  defaultValue="CONTACT"
                  className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] transition-colors"
                >
                  <option value="CONTACT">Contact form</option>
                  <option value="QUOTE_REQUEST">Quote request</option>
                  <option value="NEWSLETTER">Newsletter signup</option>
                  <option value="BOOKING_ENQUIRY">Booking enquiry</option>
                  <option value="WAITLIST">Waitlist</option>
                  <option value="OTHER">Other</option>
                </select>
              </FieldRow>

              <FieldRow label="Spam protection" hint="Standard catches most spam without blocking real leads.">
                <select
                  name="spamProtectionLevel"
                  defaultValue="STANDARD"
                  className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] transition-colors"
                >
                  <option value="RELAXED">Relaxed — fewer false positives</option>
                  <option value="STANDARD">Standard — recommended</option>
                  <option value="STRICT">Strict — active attacks only</option>
                </select>
              </FieldRow>

              <FieldRow label="Website protection mode" hint="Controls origin/domain validation on incoming submissions.">
                <select
                  name="websiteProtectionMode"
                  defaultValue="STANDARD"
                  className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] transition-colors"
                >
                  <option value="OPEN">Open — no origin check</option>
                  <option value="STANDARD">Standard</option>
                  <option value="STRICT">Strict — exact domain match</option>
                </select>
              </FieldRow>

              <FieldRow label="Success redirect URL" hint="Optional. Where to send users after a successful submission.">
                <input
                  name="successRedirectUrl"
                  type="url"
                  placeholder="https://mysite.com/thank-you"
                  className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] placeholder:text-[#a1a1aa] transition-colors"
                />
              </FieldRow>
            </div>
          )}
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: "#09090b", color: "#ffffff" }}
          >
            {pending ? "Creating…" : "Create form"}
            {!pending && <ArrowRight className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
