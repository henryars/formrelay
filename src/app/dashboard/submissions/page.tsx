import Link from "next/link";
import { Inbox, Download, ArrowRight } from "lucide-react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { SubmissionsTable } from "@/components/submissions-table";

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
    <div className="px-5 py-8 md:px-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Inbox</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#09090b]">Messages</h1>
          <p className="mt-1 text-sm text-[#71717a]">
            {submissions.length} message{submissions.length !== 1 ? "s" : ""} across all forms
          </p>
        </div>
        <Link href="/dashboard/submissions/export">
          <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </Link>
      </div>

      {submissions.length === 0 ? (
        <div className="rounded-[28px] border-2 border-dashed border-[#e4e4e7] py-20 flex flex-col items-center text-center gap-5">
          <div className="h-14 w-14 rounded-full bg-[#f4f4f5] flex items-center justify-center">
            <Inbox className="h-7 w-7 text-[#a1a1aa]" />
          </div>
          <div>
            <p className="font-semibold text-[#09090b] text-lg">No messages yet</p>
            <p className="text-sm text-[#71717a] mt-2 max-w-sm">
              Once you connect a form and someone submits it, entries will appear here.
            </p>
          </div>
          <Link href="/dashboard/forms">
            <Button className="gap-1">
              Set up a form <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <SubmissionsTable submissions={submissions} />
      )}
    </div>
  );
}
