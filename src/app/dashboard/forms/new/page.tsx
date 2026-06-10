import Link from "next/link";
import { ChevronLeft, Globe, ArrowRight } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { NewFormClient } from "./new-form-client";

export const dynamic = "force-dynamic";

export default async function NewFormPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { websiteId } = await searchParams;

  const websites = await prisma.website.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { websiteName: "asc" },
    select: { id: true, websiteName: true },
  });

  return (
    <div className="px-5 py-8 md:px-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/forms"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to forms
        </Link>
        <PageHeader
          label="New form"
          title="Create a form"
          description="Each form gets a unique address. Paste it into your HTML or AI builder and messages start flowing."
        />
      </div>

      {websites.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#a1a1aa]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b]">No websites yet</p>
              <p className="text-sm text-[#71717a] mt-1">
                Register a website first, then create a form under it.
              </p>
            </div>
            <Link href="/dashboard/websites/new">
              <Button className="gap-1.5">
                Add a website <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <NewFormClient websites={websites} defaultWebsiteId={websiteId} />
      )}
    </div>
  );
}
