import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, Phone, Globe, FileText, ShieldAlert } from "lucide-react";

import { SubmissionSpamReviewForm } from "@/components/submission-spam-review-form";
import { SubmissionStatusForm } from "@/components/submission-status-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { submissionId } = await params;

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, workspaceId: workspace.id },
    include: { website: true, form: true, emailLogs: true, spamEvents: true },
  });

  if (!submission) notFound();

  const fields = parseFieldItems(submission.fieldItems);
  const spamReasons = Array.isArray(submission.spamReasons)
    ? (submission.spamReasons as Array<{ code?: string; label?: string; score?: number; severity?: string }>)
    : [];

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/submissions"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to submissions
        </Link>
        <PageHeader
          label="Submission"
          title={submission.submitterName ?? "Unknown sender"}
          description={`${submission.form.formName} · ${submission.website.websiteName}`}
        >
          <Badge variant={
            submission.spamStatus === "CLEAN" ? "success" :
            submission.spamStatus === "SUSPICIOUS" ? "warning" : "destructive"
          }>
            {submission.spamStatus}
          </Badge>
          <Badge variant="secondary">{submission.status}</Badge>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: field values */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Form fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {fields.map((field, i) => (
                <div key={`${field.key ?? i}`}>
                  <p className="text-xs text-[#a1a1aa] mb-1">{field.label ?? field.key}</p>
                  <p className="text-sm text-[#09090b] bg-[#fafafa] border border-[#f4f4f5] rounded-lg px-3 py-2">
                    {Array.isArray(field.value) ? field.value.join(", ") : (field.value || "—")}
                  </p>
                </div>
              ))}
              {fields.length === 0 && (
                <p className="text-sm text-[#a1a1aa]">No field data captured.</p>
              )}
            </CardContent>
          </Card>

          {submission.emailLogs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Email delivery log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {submission.emailLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm py-1.5">
                    <div>
                      <p className="text-[#09090b] font-medium">{log.recipientEmail}</p>
                      <p className="text-xs text-[#a1a1aa]">{log.emailSubject}</p>
                    </div>
                    <Badge variant={log.emailStatus === "SENT" ? "success" : "secondary"} className="text-xs">
                      {log.emailStatus}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: metadata and actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Sender info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-[#a1a1aa]" />
                <p className="text-sm text-[#09090b]">{submission.submitterEmail ?? "Not detected"}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[#a1a1aa]" />
                <p className="text-sm text-[#09090b]">{submission.submitterPhone ?? "Not detected"}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4 text-[#a1a1aa]" />
                <p className="text-sm text-[#09090b] truncate">{submission.sourceUrl ?? "Not captured"}</p>
              </div>
              <Separator />
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-[#a1a1aa]" />
                <p className="text-sm text-[#09090b]">{submission.form.formName}</p>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="h-4 w-4 text-[#a1a1aa]" />
                <p className="text-sm text-[#09090b]">Score: {submission.spamScore} · {submission.spamBucket}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SubmissionStatusForm submissionId={submission.id} defaultStatus={submission.status} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Spam classification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SubmissionSpamReviewForm submissionId={submission.id} mode="spam" />
              {spamReasons.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wide">Triggered signals</p>
                    {spamReasons.map((reason, i) => (
                      <div key={`${reason.code ?? i}`} className="flex items-center justify-between text-xs py-1">
                        <span className="text-[#52525b]">{reason.label ?? "Signal triggered"}</span>
                        <span className="text-[#a1a1aa]">+{reason.score ?? 0} {reason.severity ? `· ${reason.severity}` : ""}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
