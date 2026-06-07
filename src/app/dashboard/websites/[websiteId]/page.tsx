import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Plus, ExternalLink, FileText, Inbox } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { websiteId } = await params;

  const website = await prisma.website.findFirst({
    where: { id: websiteId, workspaceId: workspace.id },
    include: {
      forms: { orderBy: { createdAt: "desc" } },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { form: true },
      },
    },
  });

  if (!website) notFound();

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/websites"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to websites
        </Link>
        <PageHeader
          label="Website"
          title={website.websiteName}
          description={website.websiteUrl}
        >
          <Link href={`/dashboard/forms/new?websiteId=${website.id}`}>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create form inbox
            </Button>
          </Link>
        </PageHeader>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Form inboxes */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Form inboxes</CardTitle>
              <Link href={`/dashboard/forms/new?websiteId=${website.id}`}>
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                  <Plus className="h-3 w-3" /> New
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {website.forms.length ? (
              <div className="divide-y divide-[#f4f4f5]">
                {website.forms.map((form) => (
                  <Link
                    key={form.id}
                    href={`/dashboard/forms/${form.id}`}
                    className="flex items-center justify-between px-6 py-4 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#09090b]">{form.formName}</p>
                        <p className="text-xs text-[#a1a1aa]">/f/{form.publicFormId}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={form.status === "ACTIVE" ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {form.status}
                      </Badge>
                      <ExternalLink className="h-3.5 w-3.5 text-[#a1a1aa]" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <FileText className="h-8 w-8 text-[#d4d4d8] mx-auto mb-3" />
                <p className="text-sm font-medium text-[#71717a]">No form inboxes yet</p>
                <p className="text-xs text-[#a1a1aa] mt-1 mb-4">
                  Create one to get a unique endpoint URL for your HTML form.
                </p>
                <Link href={`/dashboard/forms/new?websiteId=${website.id}`}>
                  <Button size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" />
                    Create form inbox
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent submissions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent submissions</CardTitle>
              <Link href="/dashboard/submissions">
                <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {website.submissions.length ? (
              <div className="divide-y divide-[#f4f4f5]">
                {website.submissions.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/dashboard/submissions/${sub.id}`}
                    className="block px-6 py-3.5 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-[#09090b] truncate">
                        {sub.submitterName ?? "Unknown"}
                      </p>
                      <Badge variant="secondary" className="text-[10px] shrink-0">
                        {sub.form.formName}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#71717a] line-clamp-2">
                      {sub.messagePreview ?? "Submission received."}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <Inbox className="h-7 w-7 text-[#d4d4d8] mx-auto mb-2" />
                <p className="text-sm text-[#a1a1aa]">No submissions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
