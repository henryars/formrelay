import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { SubmissionSpamReviewForm } from "@/components/submission-spam-review-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SpamDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { submissionId } = await params;

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, workspaceId: workspace.id, spamBucket: "SPAM" },
    include: { website: true, form: true, spamEvents: true },
  });

  if (!submission) notFound();

  const spamReasons = Array.isArray(submission.spamReasons)
    ? (submission.spamReasons as Array<{ code?: string; label?: string; score?: number; severity?: string }>)
    : [];

  const renderedReasons = spamReasons.length
    ? spamReasons.map((r, i) => ({
        key: `${r.code ?? "reason"}-${i}`,
        label: r.label ?? "Spam rule triggered",
        score: r.score ?? 0,
        severity: r.severity ?? null,
      }))
    : submission.spamEvents.map((e) => ({
        key: e.id,
        label: e.reason,
        score: e.scoreAdded,
        severity: null,
      }));

  return (
    <div className="px-8 py-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/spam"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to spam
        </Link>
        <PageHeader
          label="Spam detail"
          title={submission.submitterName ?? "Unknown sender"}
          description={`${submission.form.formName} · ${submission.website.websiteName}`}
        >
          <Badge variant="destructive">Score {submission.spamScore}</Badge>
        </PageHeader>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Why it was flagged</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {renderedReasons.map((r) => (
            <div key={r.key} className="flex items-center justify-between text-sm py-1.5 border-b border-[#f4f4f5] last:border-0">
              <span className="text-[#52525b]">{r.label}</span>
              <span className="text-xs text-[#a1a1aa]">+{r.score}{r.severity ? ` · ${r.severity}` : ""}</span>
            </div>
          ))}
          {renderedReasons.length === 0 && (
            <p className="text-sm text-[#a1a1aa]">No specific signals captured.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recover this lead</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#71717a] mb-4">
            If this looks like a real submission, move it back to the inbox. You can also resend the email notification.
          </p>
          <SubmissionSpamReviewForm submissionId={submission.id} mode="recover" />
        </CardContent>
      </Card>
    </div>
  );
}
