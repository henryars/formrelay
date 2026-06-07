import Link from "next/link";

import { DashboardNav } from "@/components/dashboard-nav";
import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, workspace, websites, forms, submissions, spamCount, recentSubmissions } =
    await getDashboardData();

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-10 md:px-8">
      <section className="flex flex-col gap-4 rounded-[20px] bg-white p-8 shadow-subtle md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-invoice-blue">Workspace overview</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
            {workspace.workspaceName}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-8 text-charcoal-whisper">
            Welcome back, {user.fullName}. Create the websites you manage, attach form inboxes,
            and route submissions without spinning up a custom backend per client.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/dashboard/websites/new" className="button-primary">
            Add website
          </Link>
          <Link href="/dashboard/forms/new" className="button-secondary">
            Create form inbox
          </Link>
        </div>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Websites", value: String(websites.length) },
          { label: "Forms", value: String(forms.length) },
          { label: "Submissions", value: String(submissions) },
          { label: "Spam blocked", value: String(spamCount) },
        ].map((item) => (
          <div key={item.label} className="rounded-[20px] bg-white p-6 shadow-subtle">
            <p className="text-sm text-graphite-mute">{item.label}</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-midnight-ink">
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-invoice-blue">Websites</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-midnight-ink">
                Active properties
              </h2>
            </div>
            <Link href="/dashboard/websites/new" className="text-sm font-medium text-midnight-ink">
              Add another
            </Link>
          </div>

          {websites.length ? (
            <div className="overflow-hidden rounded-[20px] border border-[#eef2f5]">
              <table className="w-full border-collapse text-left">
                <thead className="bg-cool-mist text-sm text-graphite-mute">
                  <tr>
                    <th className="px-4 py-3 font-medium">Website</th>
                    <th className="px-4 py-3 font-medium">Forms</th>
                    <th className="px-4 py-3 font-medium">Submissions</th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map((website) => (
                    <tr key={website.id} className="border-t border-[#eef2f5]">
                      <td className="px-4 py-4">
                        <Link
                          href={`/dashboard/websites/${website.id}`}
                          className="font-medium text-midnight-ink"
                        >
                          {website.websiteName}
                        </Link>
                        <p className="text-sm text-graphite-mute">{website.websiteUrl}</p>
                      </td>
                      <td className="px-4 py-4 text-charcoal-whisper">{website.forms.length}</td>
                      <td className="px-4 py-4 text-charcoal-whisper">{website._count.submissions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-[20px] bg-cool-mist p-6 text-charcoal-whisper">
              No websites yet. Add your first site to start generating form endpoints.
            </div>
          )}
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Recent submissions</p>
          <div className="mt-6 space-y-4">
            {recentSubmissions.length ? (
              recentSubmissions.map((submission) => (
                <div key={submission.id} className="rounded-[20px] bg-cool-mist px-4 py-4">
                  <p className="font-medium text-midnight-ink">
                    {submission.submitterName ?? "Unknown sender"}
                  </p>
                  <p className="mt-1 text-sm text-graphite-mute">
                    {submission.form.formName} on {submission.website.websiteName}
                  </p>
                  <p className="mt-3 text-sm leading-7 text-charcoal-whisper">
                    {submission.messagePreview ?? "Submission received and stored."}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[20px] bg-cool-mist px-4 py-4 text-sm text-charcoal-whisper">
                No submissions yet. Create a form inbox and submit a test entry from your site.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
