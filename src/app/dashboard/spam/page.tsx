import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SpamPage() {
  const { workspace } = await requireWorkspace();

  const submissions = await prisma.submission.findMany({
    where: {
      workspaceId: workspace.id,
      spamBucket: "SPAM",
    },
    orderBy: { createdAt: "desc" },
    include: {
      website: true,
      form: true,
      spamEvents: true,
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Spam inbox</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Suspicious traffic stays out of the main flow.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-whisper">
          Every spam-marked submission stays reviewable here so you can recover real leads without
          teaching bots what passed.
        </p>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="grid gap-6">
        {submissions.length ? (
          submissions.map((submission) => (
            <article key={submission.id} className="rounded-[20px] bg-white p-6 shadow-subtle">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Link href={`/dashboard/spam/${submission.id}`} className="text-lg font-semibold text-midnight-ink">
                    {submission.submitterName ?? "Unknown sender"}
                  </Link>
                  <p className="mt-1 text-sm text-graphite-mute">
                    {submission.form.formName} on {submission.website.websiteName}
                  </p>
                </div>
                <span className="rounded-full bg-wash-petal px-3 py-1 text-sm font-medium text-midnight-ink">
                  Score {submission.spamScore}
                </span>
              </div>

              <p className="mt-5 max-w-3xl text-sm leading-7 text-charcoal-whisper">
                {submission.messagePreview ?? "Submission stored in spam for review."}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                {submission.spamEvents.map((event) => (
                  <span
                    key={event.id}
                    className="rounded-full bg-cool-mist px-3 py-1 text-xs text-midnight-ink"
                  >
                    {event.reason} ({event.scoreAdded >= 0 ? "+" : ""}
                    {event.scoreAdded})
                  </span>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[20px] bg-white p-6 shadow-subtle text-charcoal-whisper">
            No spam found. When suspicious submissions are detected, we’ll keep them here instead of
            deleting them.
          </div>
        )}
      </section>
    </main>
  );
}
