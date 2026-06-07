import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { SubmissionSpamReviewForm } from "@/components/submission-spam-review-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SpamDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { submissionId } = await params;

  const submission = await prisma.submission.findFirst({
    where: {
      id: submissionId,
      workspaceId: workspace.id,
      spamBucket: "SPAM",
    },
    include: {
      website: true,
      form: true,
      spamEvents: true,
    },
  });

  if (!submission) {
    notFound();
  }

  const spamReasons = Array.isArray(submission.spamReasons)
    ? (submission.spamReasons as Array<{
        code?: string;
        label?: string;
        score?: number;
        severity?: string;
      }>)
    : [];
  const renderedReasons = spamReasons.length
    ? spamReasons.map((reason, index) => ({
        key: `${reason.code ?? "reason"}-${index}`,
        label: reason.label ?? "Spam rule triggered",
        score: reason.score ?? 0,
        severity: reason.severity ?? null,
      }))
    : submission.spamEvents.map((event) => ({
        key: event.id,
        label: event.reason,
        score: event.scoreAdded,
        severity: null,
      }));

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-invoice-blue">Spam detail</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
              Score {submission.spamScore}
            </h1>
            <p className="mt-3 text-base leading-8 text-charcoal-whisper">
              {submission.form.formName} on {submission.website.websiteName}
            </p>
          </div>
          <Link href="/dashboard/spam" className="button-secondary">
            Back to spam
          </Link>
        </div>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">
          Why it was marked as spam
        </h2>
        <div className="mt-6 space-y-3">
          {renderedReasons.map((event) => (
            <div
              key={event.key}
              className="rounded-[20px] bg-wash-petal px-4 py-4 text-sm text-midnight-ink"
            >
              <p className="font-medium">{event.label}</p>
              <p className="mt-1 text-graphite-mute">
                Score {event.score}
                {event.severity ? ` • ${event.severity}` : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Recover lead</h2>
        <p className="mt-3 text-sm leading-7 text-charcoal-whisper">
          Move this submission back into the inbox if it looks real. You can also send the
          notification again so the team sees it.
        </p>
        <div className="mt-5">
          <SubmissionSpamReviewForm submissionId={submission.id} mode="recover" />
        </div>
      </section>
    </main>
  );
}
