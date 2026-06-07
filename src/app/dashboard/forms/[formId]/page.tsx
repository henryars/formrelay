import Link from "next/link";
import { notFound } from "next/navigation";

import { DashboardNav } from "@/components/dashboard-nav";
import { FieldMappingForm } from "@/components/field-mapping-form";
import { FormProtectionForm } from "@/components/form-protection-form";
import { env } from "@/lib/env";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";

export const dynamic = "force-dynamic";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { formId } = await params;

  const form = await prisma.formInbox.findFirst({
    where: {
      id: formId,
      website: {
        workspaceId: workspace.id,
      },
    },
    include: {
      website: true,
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!form) {
    notFound();
  }

  const publicEndpoint = `${env.NEXT_PUBLIC_APP_URL}/f/${form.publicFormId}`;
  const latestSubmission = form.submissions[0];
  const fieldOptions = parseFieldItems(latestSubmission?.fieldItems)
    .map((item) => ({
      label: `${item.label ?? item.key} (${item.key})`,
      value: item.key ?? "",
    }))
    .filter((item) => item.value);

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-invoice-blue">Connect form</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
              {form.formName}
            </h1>
            <p className="mt-3 text-base leading-8 text-charcoal-whisper">
              Website: {form.website.websiteName}
            </p>
          </div>
          <Link href={`/dashboard/websites/${form.website.id}`} className="button-secondary">
            Back to website
          </Link>
        </div>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Public endpoint</p>
          <div className="mt-4 rounded-[20px] bg-cool-mist p-5">
            <p className="break-all text-sm font-medium text-midnight-ink">{publicEndpoint}</p>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[20px] bg-white p-5 shadow-subtle">
              <p className="text-sm text-graphite-mute">Recipient emails</p>
              <p className="mt-2 text-midnight-ink">{form.recipientEmails.join(", ")}</p>
            </div>
            <div className="rounded-[20px] bg-white p-5 shadow-subtle">
              <p className="text-sm text-graphite-mute">Spam protection</p>
              <p className="mt-2 text-midnight-ink">
                {form.spamProtectionLevel} / {form.websiteProtectionMode}
              </p>
            </div>
            <div className="rounded-[20px] bg-white p-5 shadow-subtle">
              <p className="text-sm text-graphite-mute">Honeypot field</p>
              <p className="mt-2 text-midnight-ink">{form.honeypotFieldName ?? "Not set"}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Connection snippet</p>
          <pre className="mt-4 overflow-x-auto rounded-[20px] bg-cool-mist p-5 text-sm leading-7 text-midnight-ink">
{`<form action="${publicEndpoint}" method="POST">
  <input name="name" required />
  <input name="email" type="email" required />
  <textarea name="message"></textarea>
  <input name="${form.honeypotFieldName ?? "_hp_formrelay"}" tabindex="-1" autocomplete="off" style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" />
  <input type="hidden" name="_fr_loaded_at" />
  <button type="submit">Send</button>
</form>
<script>
  const loadedAtField = document.querySelector('input[name="_fr_loaded_at"]');
  if (loadedAtField) loadedAtField.value = String(Date.now());
</script>`}
          </pre>
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">
          Protection settings
        </h2>
        <p className="mt-3 text-sm leading-7 text-charcoal-whisper">
          Standard mode scores mismatched sources and suspicious patterns without throwing possible
          leads away. Strict mode is better when a form is under active attack.
        </p>
        <div className="mt-6">
          <FormProtectionForm
            formId={form.id}
            defaults={{
              spamProtectionLevel: form.spamProtectionLevel,
              websiteProtectionMode: form.websiteProtectionMode,
              formType: form.formType,
              honeypotFieldName: form.honeypotFieldName,
              notifyOnLowSuspicious: form.notifyOnLowSuspicious,
              notifyOnSuspicious: form.notifyOnSuspicious,
              notifyOnSpam: form.notifyOnSpam,
              weeklySpamSummary: form.weeklySpamSummary,
            }}
          />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">Field mapping</h2>
        <p className="mt-3 text-sm leading-7 text-charcoal-whisper">
          Confirm which detected fields should power sender name, email, phone, and message previews.
        </p>
        <div className="mt-6">
          {fieldOptions.length ? (
            <FieldMappingForm
              formId={form.id}
              options={fieldOptions}
              defaults={{
                nameFieldKey: form.nameFieldKey,
                emailFieldKey: form.emailFieldKey,
                phoneFieldKey: form.phoneFieldKey,
                messageFieldKey: form.messageFieldKey,
              }}
            />
          ) : (
            <div className="rounded-[20px] bg-cool-mist p-5 text-charcoal-whisper">
              Submit a test form first, then the detected fields will appear here for mapping.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-6 shadow-subtle">
        <h2 className="text-2xl font-semibold tracking-tight text-midnight-ink">
          Recent submissions
        </h2>
        <div className="mt-6 space-y-4">
          {form.submissions.length ? (
            form.submissions.map((submission) => (
              <div key={submission.id} className="rounded-[20px] bg-cool-mist p-5">
                <Link href={`/dashboard/submissions/${submission.id}`} className="font-medium text-midnight-ink">
                  {submission.submitterName ?? "Unknown sender"}
                </Link>
                <p className="mt-1 text-sm text-graphite-mute">
                  {submission.submitterEmail ?? "No email detected"}
                </p>
                <p className="mt-3 text-sm leading-7 text-charcoal-whisper">
                  {submission.messagePreview ?? "Submission stored successfully."}
                </p>
              </div>
            ))
          ) : (
            <div className="rounded-[20px] bg-cool-mist p-5 text-charcoal-whisper">
              Waiting for the first test submission to arrive.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
