import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function WebsiteDetailPage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { websiteId } = await params;

  const website = await prisma.website.findFirst({
    where: {
      id: websiteId,
      workspaceId: workspace.id,
    },
    include: {
      forms: {
        orderBy: { createdAt: "desc" },
      },
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!website) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-invoice-blue">Website detail</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
              {website.websiteName}
            </h1>
            <p className="mt-3 text-base leading-8 text-charcoal-whisper">{website.websiteUrl}</p>
          </div>
          <Link href="/dashboard/forms/new" className="button-primary">
            Create form inbox
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Form inboxes</h2>
          <div className="mt-6 space-y-4">
            {website.forms.length ? (
              website.forms.map((form) => (
                <div key={form.id} className="rounded-[20px] bg-cool-mist p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/dashboard/forms/${form.id}`}
                        className="text-lg font-semibold text-midnight-ink"
                      >
                        {form.formName}
                      </Link>
                      <p className="mt-1 text-sm text-graphite-mute">
                        Endpoint: /f/{form.publicFormId}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-sm text-midnight-ink">
                      {form.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] bg-cool-mist p-5 text-charcoal-whisper">
                No form inboxes yet for this website.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">
            Recent submissions
          </h2>
          <div className="mt-6 space-y-4">
            {website.submissions.length ? (
              website.submissions.map((submission) => (
                <div key={submission.id} className="rounded-[20px] bg-cool-mist p-5">
                  <p className="font-medium text-midnight-ink">
                    {submission.submitterName ?? "Unknown sender"}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-charcoal-whisper">
                    {submission.messagePreview ?? "Submission stored successfully."}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] bg-cool-mist p-5 text-charcoal-whisper">
                No submissions have arrived for this website yet.
              </div>
            )}
          </div>
        </div>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>
    </main>
  );
}
