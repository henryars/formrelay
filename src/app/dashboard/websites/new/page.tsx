import { createWebsiteAction } from "@/app/actions/forms";
import { DashboardNav } from "@/components/dashboard-nav";
import { EntityForm } from "@/components/entity-form";
import { requireWorkspace } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function NewWebsitePage() {
  await requireWorkspace();

  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Add website</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Register a site you want FormRelay to serve.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-whisper">
          The website URL and allowed domains help secure the form endpoint while keeping setup
          simple for static and no-code projects.
        </p>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <EntityForm
          action={createWebsiteAction}
          submitLabel="Create website"
          fields={[
            { name: "websiteName", label: "Website name", placeholder: "Client Restaurant Website" },
            { name: "websiteUrl", label: "Website URL", type: "url", placeholder: "https://clientsite.com" },
            {
              name: "defaultRecipientEmail",
              label: "Default recipient email",
              type: "email",
              placeholder: "hello@clientsite.com",
            },
            {
              name: "allowedDomains",
              label: "Allowed domains",
              placeholder: "clientsite.com, www.clientsite.com",
            },
            {
              name: "defaultSuccessRedirect",
              label: "Default success redirect",
              type: "url",
              placeholder: "https://clientsite.com/thank-you",
            },
            {
              name: "timezone",
              label: "Timezone",
              placeholder: "Africa/Lagos",
            },
          ]}
        />
      </section>
    </main>
  );
}
