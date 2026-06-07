import Link from "next/link";
import { FileText, Plus, Globe, Inbox, ArrowRight, ExternalLink } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  const { workspace } = await requireWorkspace();
  const forms = await prisma.formInbox.findMany({
    where: { website: { workspaceId: workspace.id } },
    orderBy: { createdAt: "desc" },
    include: {
      website: true,
      _count: { select: { submissions: true } },
    },
  });

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        label="Forms"
        title="Form inboxes"
        description="Each form inbox has a unique endpoint. Point your HTML form's action attribute to it."
      >
        <Link href="/dashboard/forms/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New form inbox
          </Button>
        </Link>
      </PageHeader>

      {forms.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-16 flex flex-col items-center text-center gap-5">
            <div className="h-14 w-14 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <FileText className="h-7 w-7 text-[#a1a1aa]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b] text-lg">No form inboxes yet</p>
              <p className="text-sm text-[#71717a] mt-2 max-w-sm">
                Create a form inbox to get a unique endpoint URL. Paste it into your HTML form&apos;s <code className="text-xs bg-[#f4f4f5] px-1 py-0.5 rounded">action</code> attribute and submissions start flowing.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/forms/new">
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Create form inbox
                </Button>
              </Link>
              <Link href="/dashboard/onboarding">
                <Button variant="ghost" className="gap-1">
                  Setup guide <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{forms.length} form inbox{forms.length !== 1 ? "es" : ""}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#f4f4f5]">
              {forms.map((form) => (
                <Link
                  key={form.id}
                  href={`/dashboard/forms/${form.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#fafafa] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#09090b]">{form.formName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Globe className="h-3 w-3 text-[#a1a1aa]" />
                        <p className="text-xs text-[#a1a1aa] truncate">{form.website.websiteName}</p>
                        <span className="text-[#e4e4e7]">·</span>
                        <p className="text-xs text-[#a1a1aa] font-mono">/f/{form.publicFormId}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <div className="flex items-center gap-1 text-xs text-[#71717a]">
                      <Inbox className="h-3.5 w-3.5" />
                      <span>{form._count.submissions}</span>
                    </div>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
