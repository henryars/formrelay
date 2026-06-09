import Link from "next/link";
import { Globe, FileText, Zap, Check, ArrowRight } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { workspace } = await requireWorkspace();

  const [websiteCount, formCount, submissionCount] = await Promise.all([
    prisma.website.count({ where: { workspaceId: workspace.id } }),
    prisma.formInbox.count({ where: { website: { workspaceId: workspace.id } } }),
    prisma.submission.count({ where: { workspaceId: workspace.id } }),
  ]);

  const steps = [
    {
      num: 1,
      icon: Globe,
      title: "Add your website",
      description:
        "Tell us the name of your website and where you want to receive messages. This takes about 30 seconds.",
      done: websiteCount > 0,
      ctaLabel: websiteCount > 0 ? "View websites" : "Add website",
      ctaHref: websiteCount > 0 ? "/dashboard/websites" : "/dashboard/websites/new",
      hint: "You'll need your website's name and URL.",
    },
    {
      num: 2,
      icon: FileText,
      title: "Create your first form",
      description:
        "Give your form a name like \"Contact form\". We'll generate a unique address for it right away.",
      done: formCount > 0,
      ctaLabel: formCount > 0 ? "View forms" : "Create form",
      ctaHref: formCount > 0 ? "/dashboard/forms" : "/dashboard/forms/new",
      hint: "Choose the website you just added and enter the email where you want messages sent.",
    },
    {
      num: 3,
      icon: Zap,
      title: "Connect your form",
      description:
        "We'll give you a one-click prompt to paste into your AI builder, or a code snippet for manual setup. Then send yourself a test message.",
      done: submissionCount > 0,
      ctaLabel: "Connect my form",
      ctaHref: "/dashboard/forms",
      hint: "After connecting, submit the form once to confirm everything is working.",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#f4f4f5] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-[600px] space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#09090b]">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#09090b]">
            {allDone ? "You're all set! 🎉" : "Let's get your form working"}
          </h1>
          <p className="mt-2 text-sm text-[#71717a]">
            {allDone
              ? "Your form is live and receiving messages."
              : "3 steps to go from zero to receiving real messages from your website."}
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-[#ececee] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#09090b] transition-all duration-500"
              style={{ width: `${(completedCount / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[#71717a] tabular-nums shrink-0">
            {completedCount} of {steps.length} done
          </span>
        </div>

        {/* All done card */}
        {allDone && (
          <div className="rounded-[28px] bg-[#f0fdf4] border border-[#bbf7d0] p-6 flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#16a34a]">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-[#15803d]">Your form is live!</p>
              <p className="mt-1 text-sm text-[#16a34a]">
                Messages from your website will now land in your inbox with email alerts.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 rounded-full px-4 py-2 text-xs font-bold"
              style={{ backgroundColor: "#09090b", color: "#ffffff" }}
            >
              Go to dashboard
            </Link>
          </div>
        )}

        {/* Steps */}
        <div className="space-y-4">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className={`rounded-[28px] bg-white border p-6 transition-all ${
                  step.done ? "border-[#bbf7d0] opacity-75" : "border-[#ececee]"
                }`}
                style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
              >
                <div className="flex gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] ${
                      step.done ? "bg-[#f0fdf4]" : "bg-[#f4f4f5]"
                    }`}
                  >
                    {step.done ? (
                      <Check className="h-5 w-5 text-[#16a34a]" />
                    ) : (
                      <Icon className={`h-5 w-5 ${
                        step.num === completedCount + 1 ? "text-[#0098f2]" : "text-[#a1a1aa]"
                      }`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-base ${
                            step.done ? "text-[#a1a1aa] line-through" : "text-[#09090b]"
                          }`}
                        >
                          {step.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-[1.65] text-[#71717a]">
                          {step.description}
                        </p>
                        {!step.done && (
                          <p className="mt-2 text-xs text-[#a1a1aa]">
                            💡 {step.hint}
                          </p>
                        )}
                      </div>
                      <Link
                        href={step.ctaHref}
                        className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors"
                        style={
                          step.done
                            ? { backgroundColor: "#e4e4e7", color: "#3f3f46" }
                            : {
                                backgroundColor: "#09090b",
                                color: "#ffffff",
                                boxShadow:
                                  "rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px",
                              }
                        }
                      >
                        {step.ctaLabel}
                        {!step.done && <ArrowRight className="h-3.5 w-3.5" />}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {!allDone && (
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-[#a1a1aa] hover:text-[#52525b] transition-colors"
            >
              Skip for now, go to dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
