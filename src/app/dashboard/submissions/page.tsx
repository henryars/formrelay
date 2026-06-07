import Link from "next/link";
import { Inbox, Download, ArrowRight } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const { workspace } = await requireWorkspace();

  const submissions = await prisma.submission.findMany({
    where: {
      workspaceId: workspace.id,
      spamStatus: { in: ["CLEAN", "SUSPICIOUS"] },
    },
    orderBy: { createdAt: "desc" },
    include: { website: true, form: true },
  });

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
      <PageHeader
        label="Submissions"
        title="Inbox"
        description="Clean and reviewable submissions across all your forms."
      >
        <Link href="/dashboard/submissions/export">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </Link>
      </PageHeader>

      {submissions.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-16 flex flex-col items-center text-center gap-5">
            <div className="h-14 w-14 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <Inbox className="h-7 w-7 text-[#a1a1aa]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b] text-lg">No submissions yet</p>
              <p className="text-sm text-[#71717a] mt-2 max-w-sm">
                Once you connect a form and someone submits it, entries will appear here.
              </p>
            </div>
            <Link href="/dashboard/forms">
              <Button className="gap-1">
                Set up a form <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{submissions.length} submission{submissions.length !== 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#f4f4f5]">
              {submissions.map((sub) => {
                const fieldItems = parseFieldItems(sub.fieldItems);
                const topFields = fieldItems.slice(0, 3);

                return (
                  <Link
                    key={sub.id}
                    href={`/dashboard/submissions/${sub.id}`}
                    className="flex items-start gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#09090b]">
                          {sub.submitterName ?? "Unknown sender"}
                        </p>
                        {sub.spamStatus === "SUSPICIOUS" && (
                          <Badge variant="warning" className="text-xs">Suspicious · {sub.spamScore}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#a1a1aa]">{sub.submitterEmail ?? "No email detected"}</p>
                      {sub.messagePreview && (
                        <p className="text-xs text-[#71717a] mt-2 line-clamp-2">{sub.messagePreview}</p>
                      )}
                      {topFields.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {topFields.map((field, i) => (
                            <span
                              key={`${sub.id}-${field.key ?? i}`}
                              className="text-xs bg-[#f4f4f5] text-[#52525b] px-2 py-0.5 rounded-full"
                            >
                              {field.label ?? field.key}: {Array.isArray(field.value) ? field.value.join(", ") : field.value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <Badge variant="secondary" className="text-xs">{sub.form.formName}</Badge>
                      <p className="text-xs text-[#a1a1aa]">{sub.website.websiteName}</p>
                      <Badge variant={sub.status === "NEW" ? "blue" : "outline"} className="text-xs">
                        {sub.status}
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
