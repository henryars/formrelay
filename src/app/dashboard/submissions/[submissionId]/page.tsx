import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { SubmissionSpamReviewForm } from "@/components/submission-spam-review-form";
import { SubmissionStatusForm } from "@/components/submission-status-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
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
    },
    include: {
      website: true,
      form: true,
      emailLogs: true,
      spamEvents: true,
    },
  });

  if (!submission) {
    notFound();
  }

  const fields = parseFieldItems(submission.fieldItems);
  const spamReasons = Array.isArray(submission.spamReasons)
    ? (submission.spamReasons as Array<{
        code?: string;
        label?: string;
        score?: number;
        severity?: string;
      }>)
    : [];

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-invoice-blue">Submission detail</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
              {submission.submitterName ?? "Unknown sender"}
            </h1>
            <p className="mt-3 text-base leading-8 text-charcoal-whisper">
              {submission.form.formName} on {submission.website.websiteName}
            </p>
          </div>
          <Link href="/dashboard/submissions" className="button-secondary">
            Back to submissions
          </Link>
        </div>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Field values</h2>
          <div className="mt-6 space-y-4">
            {fields.map((field, index) => (
              <div key={`${field.key ?? index}`} className="rounded-[20px] bg-cool-mist p-4">
                <p className="text-sm text-graphite-mute">{field.label ?? field.key}</p>
                <p className="mt-2 text-midnight-ink">
                  {Array.isArray(field.value) ? field.value.join(", ") : field.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[20px] bg-white p-6 shadow-subtle">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Metadata</h2>
            <div className="mt-5 space-y-3 text-sm text-charcoal-whisper">
              <p>Email: {submission.submitterEmail ?? "Not detected"}</p>
              <p>Phone: {submission.submitterPhone ?? "Not detected"}</p>
              <p>Source URL: {submission.sourceUrl ?? "Not captured"}</p>
              <p>Status: {submission.status}</p>
              <p>Spam status: {submission.spamStatus}</p>
              <p>Spam bucket: {submission.spamBucket}</p>
              <p>Spam score: {submission.spamScore}</p>
              <p>Notification: {submission.notificationStatus}</p>
            </div>
          </section>

          <section className="rounded-[20px] bg-white p-6 shadow-subtle">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Update status</h2>
            <div className="mt-5">
              <SubmissionStatusForm submissionId={submission.id} defaultStatus={submission.status} />
            </div>
          </section>

          <section className="rounded-[20px] bg-white p-6 shadow-subtle">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Spam review</h2>
            <p className="mt-3 text-sm leading-7 text-charcoal-whisper">
              Keep possible leads in the inbox and push obvious junk back to spam without losing the
              audit trail.
            </p>
            <div className="mt-5">
              <SubmissionSpamReviewForm submissionId={submission.id} mode="spam" />
            </div>
          </section>

          {spamReasons.length ? (
            <section className="rounded-[20px] bg-white p-6 shadow-subtle">
              <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">
                Spam signals
              </h2>
              <div className="mt-5 space-y-3">
                {spamReasons.map((reason, index) => (
                  <div key={`${reason.code ?? "reason"}-${index}`} className="rounded-[20px] bg-cool-mist p-4">
                    <p className="font-medium text-midnight-ink">
                      {reason.label ?? "Spam rule triggered"}
                    </p>
                    <p className="mt-1 text-sm text-graphite-mute">
                      Score {reason.score ?? 0}
                      {reason.severity ? ` • ${reason.severity}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="rounded-[20px] bg-white p-6 shadow-subtle">
            <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Email logs</h2>
            <div className="mt-5 space-y-3 text-sm text-charcoal-whisper">
              {submission.emailLogs.length ? (
                submission.emailLogs.map((log) => (
                  <div key={log.id} className="rounded-[20px] bg-cool-mist p-4">
                    <p className="font-medium text-midnight-ink">{log.emailStatus}</p>
                    <p className="mt-1">{log.recipientEmail}</p>
                    <p className="mt-1">{log.emailSubject}</p>
                  </div>
                ))
              ) : (
                <p>No email logs yet.</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
