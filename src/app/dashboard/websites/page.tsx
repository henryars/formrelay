import Link from "next/link";
import { Globe, Plus, ArrowRight, FileText, Inbox } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  const { workspace } = await requireWorkspace();
  const websites = await prisma.website.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: {
      forms: true,
      _count: { select: { submissions: true } },
    },
  });

  return (
    <div className="px-8 py-8 max-w-4xl mx-auto space-y-8">
      <PageHeader
        label="Websites"
        title="Registered websites"
        description="Each website groups your form inboxes and submission history."
      >
        <Link href="/dashboard/websites/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add website
          </Button>
        </Link>
      </PageHeader>

      {websites.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-16 flex flex-col items-center text-center gap-5">
            <div className="h-14 w-14 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <Globe className="h-7 w-7 text-[#a1a1aa]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b] text-lg">No websites yet</p>
              <p className="text-sm text-[#71717a] mt-2 max-w-sm">
                Add a website to start creating form inboxes. Once you have a form inbox, copy the endpoint URL into your HTML form.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/websites/new">
                <Button className="gap-1.5">
                  <Plus className="h-4 w-4" />
                  Add your first website
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
        <div className="grid gap-4 sm:grid-cols-2">
          {websites.map((website) => (
            <Link key={website.id} href={`/dashboard/websites/${website.id}`}>
              <Card className="hover:shadow-md transition-all hover:border-[#d4d4d8] cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <Globe className="h-4.5 w-4.5 text-blue-600" />
                    </div>
                    <Badge variant="secondary" className="text-xs">{website.forms.length} form{website.forms.length !== 1 ? "s" : ""}</Badge>
                  </div>
                  <p className="font-semibold text-[#09090b]">{website.websiteName}</p>
                  <p className="text-xs text-[#a1a1aa] mt-1 truncate">{website.websiteUrl}</p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-[#71717a]">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      {website.forms.length} form inbox{website.forms.length !== 1 ? "es" : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Inbox className="h-3.5 w-3.5" />
                      {website._count.submissions} submission{website._count.submissions !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {/* Add new card */}
          <Link href="/dashboard/websites/new">
            <Card className="border-dashed border-2 border-[#e4e4e7] hover:border-[#0098f2] hover:bg-blue-50/30 transition-all cursor-pointer h-full">
              <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center gap-2 min-h-[140px]">
                <Plus className="h-5 w-5 text-[#a1a1aa]" />
                <p className="text-sm font-medium text-[#71717a]">Add website</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}
