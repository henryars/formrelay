import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  const { workspace } = await requireWorkspace();
  const websites = await prisma.website.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" },
    include: {
      forms: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Websites</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          All registered properties in this workspace.
        </h1>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        {websites.length ? (
          <div className="overflow-hidden rounded-[20px] border border-[#eef2f5]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-cool-mist text-sm text-graphite-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Forms</th>
                  <th className="px-4 py-3 font-medium">Submissions</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((website) => (
                  <tr key={website.id} className="border-t border-[#eef2f5]">
                    <td className="px-4 py-4">
                      <p className="font-medium text-midnight-ink">{website.websiteName}</p>
                      <p className="text-sm text-graphite-mute">{website.websiteUrl}</p>
                    </td>
                    <td className="px-4 py-4 text-charcoal-whisper">{website.forms.length}</td>
                    <td className="px-4 py-4 text-charcoal-whisper">{website._count.submissions}</td>
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/websites/${website.id}`} className="text-sm font-medium text-midnight-ink">
                        View detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[20px] bg-cool-mist p-6 text-charcoal-whisper">
            No websites yet. Create your first one to begin onboarding.
          </div>
        )}
      </section>
    </main>
  );
}
