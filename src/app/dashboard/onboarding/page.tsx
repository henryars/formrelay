import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { workspace } = await requireWorkspace();
  const [websiteCount, formCount, submissionCount] = await Promise.all([
    prisma.website.count({ where: { workspaceId: workspace.id } }),
    prisma.formInbox.count({
      where: {
        website: {
          workspaceId: workspace.id,
        },
      },
    }),
    prisma.submission.count({
      where: {
        workspaceId: workspace.id,
      },
    }),
  ]);

  const steps = [
    {
      title: "Add your first website",
      done: websiteCount > 0,
      href: "/dashboard/websites/new",
      cta: "Create website",
    },
    {
      title: "Create a form inbox",
      done: formCount > 0,
      href: "/dashboard/forms/new",
      cta: "Create form inbox",
    },
    {
      title: "Send a test submission",
      done: submissionCount > 0,
      href: "/dashboard/submissions",
      cta: "View submissions",
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Onboarding</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Launch your first working form in three steps.
        </h1>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <article key={step.title} className="rounded-[20px] bg-white p-6 shadow-subtle">
            <p className="text-sm font-medium text-invoice-blue">0{index + 1}</p>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-midnight-ink">
              {step.title}
            </h2>
            <p className="mt-4 text-sm text-charcoal-whisper">
              {step.done ? "Done" : "Still pending"}
            </p>
            <Link href={step.href} className="button-primary mt-6 inline-flex">
              {step.cta}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
