"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, Zap, Globe, FileText, ArrowRight } from "lucide-react";

import { createWebsiteOnboardingAction, createFormInboxAction } from "@/app/actions/forms";

type Website = { id: string; websiteName: string };

interface Props {
  websites: Website[];
  formCount: number;
  submissionCount: number;
}

const INITIAL: { error?: string; message?: string } = {};

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#09090b]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#71717a]">{hint}</p>}
    </div>
  );
}

function Input({ name, type = "text", placeholder, required }: {
  name: string; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      required={required}
      className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] focus:ring-2 focus:ring-[#0098f2]/10 placeholder:text-[#a1a1aa] transition-colors"
    />
  );
}

function Select({ name, defaultValue, children }: {
  name: string; defaultValue?: string; children: React.ReactNode;
}) {
  return (
    <select
      name={name}
      defaultValue={defaultValue}
      className="w-full rounded-[12px] border border-[#e4e4e7] bg-white px-3.5 py-2.5 text-sm text-[#09090b] outline-none focus:border-[#0098f2] focus:ring-2 focus:ring-[#0098f2]/10 transition-colors"
    >
      {children}
    </select>
  );
}

function SubmitBtn({ label, loading }: { label: string; loading: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold disabled:opacity-60 transition-opacity"
      style={{ backgroundColor: "#09090b", color: "#ffffff" }}
    >
      {loading ? "Saving…" : label}
      {!loading && <ArrowRight className="h-4 w-4" />}
    </button>
  );
}

// ── Step 1: Create website ────────────────────────────────────────────
function CreateWebsiteStep() {
  const [state, action, pending] = useActionState(createWebsiteOnboardingAction, INITIAL);
  const [advanced, setAdvanced] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-[10px] bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <FieldRow label="Website name" hint="A name you'll recognise in the dashboard.">
        <Input name="websiteName" placeholder="My Restaurant Website" required />
      </FieldRow>
      <FieldRow label="Website URL" hint="The domain where your forms are hosted.">
        <Input name="websiteUrl" type="url" placeholder="https://mysite.com" required />
      </FieldRow>
      <FieldRow label="Notification email" hint="Where you want to receive messages by default.">
        <Input name="defaultRecipientEmail" type="email" placeholder="hello@mysite.com" required />
      </FieldRow>

      {/* Advanced */}
      <div className="rounded-[14px] border border-[#ececee] overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvanced(!advanced)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#52525b] hover:bg-[#fafafa] transition-colors"
        >
          Advanced options
          <ChevronDown className={`h-4 w-4 text-[#a1a1aa] transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>
        {advanced && (
          <div className="border-t border-[#ececee] px-4 py-4 space-y-4 bg-[#fafafa]">
            <FieldRow label="Allowed domains" hint="Comma-separated. Leave blank to allow all origins.">
              <Input name="allowedDomains" placeholder="mysite.com, www.mysite.com" />
            </FieldRow>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-1">
        <SubmitBtn label="Save website" loading={pending} />
        <Link href="/dashboard/onboarding?skip=website" className="text-sm text-[#a1a1aa] hover:text-[#52525b] transition-colors">
          Skip for now →
        </Link>
      </div>
    </form>
  );
}

// ── Step 2: Create form ───────────────────────────────────────────────
function CreateFormStep({ websites }: { websites: Website[] }) {
  const [state, action, pending] = useActionState(createFormInboxAction, INITIAL);
  const [advanced, setAdvanced] = useState(false);

  return (
    <form action={action} className="space-y-4">
      {state.error && (
        <p className="rounded-[10px] bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600">
          {state.error}
        </p>
      )}

      {websites.length > 1 && (
        <FieldRow label="Website">
          <Select name="websiteId">
            {websites.map((w) => (
              <option key={w.id} value={w.id}>{w.websiteName}</option>
            ))}
          </Select>
        </FieldRow>
      )}
      {websites.length === 1 && (
        <input type="hidden" name="websiteId" value={websites[0].id} />
      )}

      <FieldRow label="Form name" hint="e.g. Contact Form, Quote Request, Waitlist">
        <Input name="formName" placeholder="Contact Form" required />
      </FieldRow>
      <FieldRow label="Recipient email(s)" hint="Comma-separated. Messages will be emailed here.">
        <Input name="recipientEmails" type="email" placeholder="hello@mysite.com" required />
      </FieldRow>

      {/* Advanced */}
      <div className="rounded-[14px] border border-[#ececee] overflow-hidden">
        <button
          type="button"
          onClick={() => setAdvanced(!advanced)}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-[#52525b] hover:bg-[#fafafa] transition-colors"
        >
          Advanced options
          <ChevronDown className={`h-4 w-4 text-[#a1a1aa] transition-transform ${advanced ? "rotate-180" : ""}`} />
        </button>
        {advanced && (
          <div className="border-t border-[#ececee] px-4 py-4 space-y-4 bg-[#fafafa]">
            <FieldRow label="Form type" hint="Helps categorise submissions in your inbox.">
              <Select name="formType" defaultValue="CONTACT">
                <option value="CONTACT">Contact form</option>
                <option value="QUOTE_REQUEST">Quote request</option>
                <option value="NEWSLETTER">Newsletter signup</option>
                <option value="BOOKING_ENQUIRY">Booking enquiry</option>
                <option value="WAITLIST">Waitlist</option>
                <option value="OTHER">Other</option>
              </Select>
            </FieldRow>
            <FieldRow label="Spam protection" hint="Standard catches most spam without false positives.">
              <Select name="spamProtectionLevel" defaultValue="STANDARD">
                <option value="RELAXED">Relaxed — fewer false positives</option>
                <option value="STANDARD">Standard — recommended</option>
                <option value="STRICT">Strict — active attacks only</option>
              </Select>
            </FieldRow>
            <FieldRow label="Website protection mode" hint="Controls origin/domain validation.">
              <Select name="websiteProtectionMode" defaultValue="STANDARD">
                <option value="OPEN">Open — no origin check</option>
                <option value="STANDARD">Standard</option>
                <option value="STRICT">Strict — exact domain match</option>
              </Select>
            </FieldRow>
            <FieldRow label="Success redirect URL" hint="Optional. Where to send users after submission.">
              <Input name="successRedirectUrl" type="url" placeholder="https://mysite.com/thank-you" />
            </FieldRow>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 pt-1">
        <SubmitBtn label="Create form" loading={pending} />
        <Link href="/dashboard/onboarding?skip=form" className="text-sm text-[#a1a1aa] hover:text-[#52525b] transition-colors">
          Skip for now →
        </Link>
      </div>
    </form>
  );
}

// ── Main wizard ───────────────────────────────────────────────────────
export function OnboardingWizard({ websites, formCount, submissionCount }: Props) {
  const hasWebsite = websites.length > 0;
  const hasForm = formCount > 0;
  const hasSubmission = submissionCount > 0;
  const allDone = hasWebsite && hasForm && hasSubmission;

  const completedCount = [hasWebsite, hasForm, hasSubmission].filter(Boolean).length;

  const steps = [
    {
      num: 1,
      icon: Globe,
      title: "Add your website",
      subtitle: "Tell us where your form lives.",
      done: hasWebsite,
    },
    {
      num: 2,
      icon: FileText,
      title: "Create your first form",
      subtitle: "Name your form and set a notification email.",
      done: hasForm,
    },
    {
      num: 3,
      icon: Zap,
      title: "Connect and test",
      subtitle: "Paste the AI prompt into your builder, then send a test.",
      done: hasSubmission,
    },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f4f4f5] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-[620px] space-y-6">

        {/* Header */}
        <div className="text-center mb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px]"
            style={{ backgroundColor: "#09090b" }}>
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#09090b]">
            {allDone ? "You're all set! 🎉" : "Let's get your form working"}
          </h1>
          <p className="mt-2 text-sm text-[#71717a]">
            {allDone
              ? "Your form is live and receiving messages."
              : "3 steps · takes about 2 minutes"}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[#ececee] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#09090b] transition-all duration-500"
              style={{ width: `${(completedCount / 3) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#71717a] tabular-nums shrink-0">
            {completedCount} of 3 done
          </span>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;
            const isCurrentStep = !step.done && steps.slice(0, step.num - 1).every((s) => s.done);

            return (
              <div
                key={step.num}
                className="rounded-[28px] bg-white border transition-all"
                style={{
                  borderColor: step.done ? "#bbf7d0" : isCurrentStep ? "#e4e4e7" : "#ececee",
                  boxShadow: isCurrentStep ? "rgba(0,0,0,0.06) 0px 4px 16px 0px" : "rgba(0,0,0,0.03) 0px 2px 8px 0px",
                  opacity: !step.done && !isCurrentStep ? 0.6 : 1,
                }}
              >
                {/* Step header */}
                <div className="flex items-center gap-4 p-6 pb-4">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px]"
                    style={{ backgroundColor: step.done ? "#f0fdf4" : "#f4f4f5" }}
                  >
                    {step.done
                      ? <Check className="h-5 w-5 text-[#16a34a]" />
                      : <Icon className="h-5 w-5" style={{ color: isCurrentStep ? "#0098f2" : "#a1a1aa" }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-base ${step.done ? "text-[#a1a1aa] line-through" : "text-[#09090b]"}`}>
                      {step.title}
                    </p>
                    <p className="text-sm text-[#71717a] mt-0.5">{step.subtitle}</p>
                  </div>
                  {step.done && (
                    <span className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: "#f0fdf4", color: "#16a34a" }}>
                      Done
                    </span>
                  )}
                </div>

                {/* Inline form for current step */}
                {isCurrentStep && (
                  <div className="px-6 pb-6 border-t border-[#f4f4f5] pt-5">
                    {step.num === 1 && <CreateWebsiteStep />}
                    {step.num === 2 && <CreateFormStep websites={websites} />}
                    {step.num === 3 && (
                      <div className="space-y-4">
                        <p className="text-sm text-[#71717a]">
                          Go to your form, copy the AI prompt, and paste it into Lovable, ChatGPT, or your builder.
                          Then submit the form once to confirm it's working.
                        </p>
                        <div className="flex items-center gap-4">
                          <Link
                            href="/dashboard/forms"
                            className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
                            style={{ backgroundColor: "#09090b", color: "#ffffff" }}
                          >
                            Go to my form <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allDone && (
          <div className="text-center pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
              style={{ backgroundColor: "#09090b", color: "#ffffff" }}
            >
              Go to dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {!allDone && (
          <div className="text-center">
            <Link href="/dashboard" className="text-sm text-[#a1a1aa] hover:text-[#52525b] transition-colors">
              Skip for now, go to dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
