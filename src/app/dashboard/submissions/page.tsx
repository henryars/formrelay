import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const { workspace } = await requireWorkspace();

  const submissions = await prisma.submission.findMany({
    where: {
      workspaceId: workspace.id,
      spamStatus: {
        in: ["CLEAN", "SUSPICIOUS"],
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      website: true,
      form: true,
    },
  });

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Submissions</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Clean and reviewable leads in one table.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-whisper">
          These are the submissions your team should care about first. Spam stays separated so the
          inbox remains usable.
        </p>
        <div className="mt-6">
          <DashboardNav />
        </div>
        <div className="mt-6">
          <Link href="/dashboard/submissions/export" className="button-secondary">
            Export CSV
          </Link>
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        {submissions.length ? (
          <div className="overflow-hidden rounded-[20px] border border-[#eef2f5]">
            <table className="w-full border-collapse text-left">
              <thead className="bg-cool-mist text-sm text-graphite-mute">
                <tr>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Sender</th>
                  <th className="px-4 py-3 font-medium">Website</th>
                  <th className="px-4 py-3 font-medium">Form</th>
                  <th className="px-4 py-3 font-medium">Preview</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((submission) => {
                  const fieldItems = parseFieldItems(submission.fieldItems);
                  const primaryFields = fieldItems.slice(0, 3);

                  return (
                    <tr key={submission.id} className="border-t border-[#eef2f5] align-top">
                      <td className="px-4 py-4">
                        <span className="rounded-full bg-cool-mist px-3 py-1 text-sm text-midnight-ink">
                          {submission.status}
                        </span>
                        <div className="mt-2">
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              submission.spamStatus === "SUSPICIOUS"
                                ? "bg-wash-petal text-midnight-ink"
                                : "bg-wash-sky text-midnight-ink"
                            }`}
                          >
                            {submission.spamStatus === "SUSPICIOUS"
                              ? `Suspicious • ${submission.spamScore}`
                              : "Looks okay"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/dashboard/submissions/${submission.id}`} className="block">
                        <p className="font-medium text-midnight-ink">
                          {submission.submitterName ?? "Unknown sender"}
                        </p>
                        <p className="text-sm text-graphite-mute">
                          {submission.submitterEmail ?? "No email detected"}
                        </p>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-charcoal-whisper">{submission.website.websiteName}</td>
                      <td className="px-4 py-4 text-charcoal-whisper">{submission.form.formName}</td>
                      <td className="px-4 py-4">
                        <p className="max-w-sm text-sm leading-7 text-charcoal-whisper">
                          {submission.messagePreview ?? "Submission stored successfully."}
                        </p>
                        {primaryFields.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {primaryFields.map((field, index) => (
                              <span
                                key={`${submission.id}-${field.key ?? index}`}
                                className="rounded-full bg-wash-sky px-3 py-1 text-xs text-midnight-ink"
                              >
                                {field.label ?? field.key}:{" "}
                                {Array.isArray(field.value) ? field.value.join(", ") : field.value}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[20px] bg-cool-mist p-6 text-charcoal-whisper">
            No non-spam submissions yet. Seed the database or submit a test form to populate this page.
          </div>
        )}
      </section>
    </main>
  );
}
