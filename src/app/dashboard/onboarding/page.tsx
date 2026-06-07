import Link from "next/link";
import { Check, Globe, FileText, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { cn } from "@/lib/utils";

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
      title: "Register your website",
      description:
        "Add the website where your form lives. This groups your form inboxes and submissions in one place.",
      done: websiteCount > 0,
      href: "/dashboard/websites/new",
      cta: websiteCount > 0 ? "View websites" : "Add website",
      ctaHref: websiteCount > 0 ? "/dashboard/websites" : "/dashboard/websites/new",
      hint: "You'll need the website's name and URL.",
    },
    {
      num: 2,
      icon: FileText,
      title: "Create a form inbox",
      description:
        "Each form inbox gets a unique public endpoint URL. Point your HTML form's action attribute to it and submissions start flowing.",
      done: formCount > 0,
      href: "/dashboard/forms/new",
      cta: formCount > 0 ? "View forms" : "Create form inbox",
      ctaHref: formCount > 0 ? "/dashboard/forms" : "/dashboard/forms/new",
      hint: "You'll choose the website, add recipient emails, and set spam settings.",
    },
    {
      num: 3,
      icon: Zap,
      title: "Send a test submission",
      description:
        "Copy the HTML snippet from your form detail page, add it to your site, and submit the form. You should receive an email within seconds.",
      done: submissionCount > 0,
      href: "/dashboard/submissions",
      cta: submissionCount > 0 ? "View submissions" : "View submissions",
      ctaHref: "/dashboard/submissions",
      hint: "Check your form's connection snippet — it includes the honeypot and load-time fields.",
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const allDone = completedCount === steps.length;

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto space-y-8">
      <PageHeader
        label="Setup guide"
        title="Get your first form working"
        description="Three steps to go from zero to receiving live form submissions with spam protection and email alerts."
      />

      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[#e4e4e7] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#0098f2] transition-all"
            style={{ width: `${(completedCount / steps.length) * 100}%` }}
          />
        </div>
        <span className="text-sm text-[#71717a] tabular-nums shrink-0">
          {completedCount} / {steps.length} done
        </span>
      </div>

      {allDone && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-5 flex items-center gap-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-900">You&apos;re all set!</p>
              <p className="text-sm text-green-700 mt-0.5">
                Your form is live and receiving submissions. Check your inbox for email alerts.
              </p>
            </div>
            <Link href="/dashboard" className="ml-auto shrink-0">
              <Button size="sm" variant="secondary">Go to dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Card
              key={step.num}
              className={cn(
                "transition-all",
                step.done && "opacity-75"
              )}
            >
              <CardContent className="p-6">
                <div className="flex gap-5">
                  {/* Step indicator */}
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
                      step.done
                        ? "bg-green-100 text-green-700"
                        : "bg-[#f4f4f5] text-[#71717a]"
                    )}
                  >
                    {step.done ? <Check className="h-4 w-4" /> : step.num}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={cn(
                          "font-semibold",
                          step.done ? "text-[#71717a] line-through" : "text-[#09090b]"
                        )}>
                          {step.title}
                        </h3>
                        <p className="mt-1 text-sm text-[#71717a] leading-relaxed">
                          {step.description}
                        </p>
                        {!step.done && (
                          <p className="mt-2 text-xs text-[#a1a1aa] flex items-center gap-1">
                            <span className="inline-block h-1 w-1 rounded-full bg-[#a1a1aa]" />
                            {step.hint}
                          </p>
                        )}
                      </div>
                      <Link href={step.ctaHref} className="shrink-0">
                        <Button
                          size="sm"
                          variant={step.done ? "secondary" : "default"}
                          className="gap-1.5"
                        >
                          {step.cta}
                          {!step.done && <ArrowRight className="h-3.5 w-3.5" />}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Help note */}
      <div className="text-center">
        <p className="text-sm text-[#a1a1aa]">
          Need help? Check the{" "}
          <Link href="/docs" className="text-[#0098f2] hover:underline">
            documentation
          </Link>{" "}
          for integration examples.
        </p>
      </div>
    </div>
  );
}
