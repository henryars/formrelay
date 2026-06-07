import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SpamPage() {
  const { workspace } = await requireWorkspace();

  const submissions = await prisma.submission.findMany({
    where: { workspaceId: workspace.id, spamBucket: "SPAM" },
    orderBy: { createdAt: "desc" },
    include: { website: true, form: true, spamEvents: true },
  });

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        label="Spam"
        title="Spam inbox"
        description="Suspicious submissions stay here so you can recover real leads without deleting anything."
      />

      {submissions.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-14 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-50 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b]">No spam yet</p>
              <p className="text-sm text-[#71717a] mt-1 max-w-xs">
                When suspicious submissions are detected they land here instead of polluting your inbox.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{submissions.length} flagged submission{submissions.length !== 1 ? "s" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#f4f4f5]">
              {submissions.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/dashboard/spam/${sub.id}`}
                  className="block px-6 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-[#09090b]">
                          {sub.submitterName ?? "Unknown sender"}
                        </p>
                        <Badge variant="destructive" className="text-xs">Score {sub.spamScore}</Badge>
                      </div>
                      <p className="text-xs text-[#a1a1aa]">
                        {sub.form.formName} · {sub.website.websiteName}
                      </p>
                      {sub.messagePreview && (
                        <p className="text-xs text-[#71717a] mt-2 line-clamp-2">{sub.messagePreview}</p>
                      )}
                      {sub.spamEvents.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {sub.spamEvents.slice(0, 4).map((event) => (
                            <span
                              key={event.id}
                              className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full border border-red-100"
                            >
                              {event.reason} ({event.scoreAdded >= 0 ? "+" : ""}{event.scoreAdded})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#a1a1aa] shrink-0 mt-1" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
