import { createFormInboxAction } from "@/app/actions/forms";
import { DashboardNav } from "@/components/dashboard-nav";
import { EntityForm } from "@/components/entity-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewFormPage() {
  const { workspace } = await requireWorkspace();
  const websites = await prisma.website.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { websiteName: "asc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Create form inbox</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Generate a public endpoint for an existing form.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-whisper">
          Every inbox gets its own endpoint, recipient routing, spam rules, and connection
          instructions for React, static HTML, or AI builders.
        </p>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        {websites.length ? (
          <EntityForm
            action={createFormInboxAction}
            submitLabel="Create form inbox"
            fields={[
              {
                name: "websiteId",
                label: "Website",
                kind: "select",
                options: websites.map((website) => ({
                  label: website.websiteName,
                  value: website.id,
                })),
              },
              { name: "formName", label: "Form name", placeholder: "Contact Form" },
              {
                name: "recipientEmails",
                label: "Recipient emails",
                placeholder: "hello@clientsite.com, sales@clientsite.com",
              },
              {
                name: "successRedirectUrl",
                label: "Success redirect URL",
                type: "url",
                placeholder: "https://clientsite.com/thank-you",
              },
              {
                name: "spamProtectionLevel",
                label: "Spam protection",
                kind: "select",
                options: [
                  { label: "Relaxed", value: "RELAXED" },
                  { label: "Standard", value: "STANDARD" },
                  { label: "Strict", value: "STRICT" },
                ],
              },
              {
                name: "websiteProtectionMode",
                label: "Website protection",
                kind: "select",
                options: [
                  { label: "Standard", value: "STANDARD" },
                  { label: "Open", value: "OPEN" },
                  { label: "Strict", value: "STRICT" },
                ],
              },
              {
                name: "formType",
                label: "Form type",
                kind: "select",
                options: [
                  { label: "Contact form", value: "CONTACT" },
                  { label: "Quote request", value: "QUOTE_REQUEST" },
                  { label: "Newsletter", value: "NEWSLETTER" },
                  { label: "Booking enquiry", value: "BOOKING_ENQUIRY" },
                  { label: "Waitlist", value: "WAITLIST" },
                  { label: "Other", value: "OTHER" },
                ],
              },
            ]}
          />
        ) : (
          <div className="rounded-[20px] bg-cool-mist p-6 text-charcoal-whisper">
            Add a website first, then you’ll be able to create its form inbox.
          </div>
        )}
      </section>
    </main>
  );
}
