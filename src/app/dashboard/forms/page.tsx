import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function FormsPage() {
  const { workspace } = await requireWorkspace();
  const forms = await prisma.formInbox.findMany({
    where: {
      website: {
        workspaceId: workspace.id,
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      website: true,
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
        <p className="text-sm font-medium text-invoice-blue">Forms</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Every inbox, endpoint, and routing rule in one place.
        </h1>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        {forms.length ? (
          <div className="overflow-hidden rounded-[20px] border border-[#eef2f5]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-cool-mist text-sm text-graphite-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Form</th>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium">Submissions</th>
                </tr>
              </thead>
              <tbody>
                {forms.map((form) => (
                  <tr key={form.id} className="border-t border-[#eef2f5]">
                    <td className="px-4 py-4">
                      <Link href={`/dashboard/forms/${form.id}`} className="font-medium text-midnight-ink">
                        {form.formName}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-charcoal-whisper">{form.website.websiteName}</td>
                    <td className="px-4 py-4 text-charcoal-whisper">/f/{form.publicFormId}</td>
                    <td className="px-4 py-4 text-charcoal-whisper">{form._count.submissions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[20px] bg-cool-mist p-6 text-charcoal-whisper">
            No form inboxes yet. Add a website first, then create a form endpoint.
          </div>
        )}
      </section>
    </main>
  );
}
