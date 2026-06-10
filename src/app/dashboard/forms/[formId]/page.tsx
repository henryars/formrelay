import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Mail, ShieldCheck, Tag, ExternalLink, Settings2 } from "lucide-react";

import { FieldMappingForm } from "@/components/field-mapping-form";
import { FormProtectionForm } from "@/components/form-protection-form";
import { EntityForm } from "@/components/entity-form";
import { ConnectCard } from "@/components/connect-card";
import { PlatformPicker } from "@/components/platform-picker";
import { FormTabs } from "@/components/form-tabs";
import { CopyButton } from "@/components/copy-button";
import { updateFormInboxSettingsAction } from "@/app/actions/forms";
import { env } from "@/lib/env";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TabsContent } from "@/components/ui/tabs";

export const dynamic = "force-dynamic";

const FORM_TABS = ["overview", "settings", "spam", "mapping"] as const;
type FormTab = (typeof FORM_TABS)[number];

export default async function FormDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { formId } = await params;
  const { tab } = await searchParams;
  const activeTab: FormTab =
    tab && FORM_TABS.includes(tab as FormTab) ? (tab as FormTab) : "overview";

  const form = await prisma.formInbox.findFirst({
    where: { id: formId, website: { workspaceId: workspace.id } },
    include: {
      website: true,
      submissions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!form) notFound();

  const publicEndpoint = `${env.NEXT_PUBLIC_APP_URL}/f/${form.publicFormId}`;
  const latestSubmission = form.submissions[0];
  const fieldOptions = parseFieldItems(latestSubmission?.fieldItems)
    .map((item) => ({
      label: `${item.label ?? item.key} (${item.key})`,
      value: item.key ?? "",
    }))
    .filter((item) => item.value);

  const htmlSnippet = `<form action="${publicEndpoint}" method="POST">
  <input name="name" placeholder="Your name" required />
  <input name="email" type="email" placeholder="Your email" required />
  <textarea name="message" placeholder="Your message"></textarea>
  <input name="${form.honeypotFieldName ?? "_hp_formrelay"}" tabindex="-1" autocomplete="off"
    style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" />
  <input type="hidden" name="_fr_loaded_at" />
  <button type="submit">Send message</button>
</form>
<script>
  const f = document.querySelector('input[name="_fr_loaded_at"]');
  if (f) f.value = String(Date.now());
</script>`;

  const aiPrompt = `Please wire the form on this page to a custom backend endpoint.

Follow these requirements:
1. Update the form tag to use: action="${publicEndpoint}" and method="POST".
2. Ensure every input field (name, email, message, etc.) has a proper, unique name attribute matching its label.
3. Handle the submission state gracefully: prevent the default reload on submit, send the data via a fetch POST request, and display a clean "Thank you! Your message has been sent." success message in place of the form.`;

  const spamStatusLabel = (s: string) =>
    s === "CLEAN" ? "Good" : s === "SUSPICIOUS" ? "Maybe spam" : "Spam";

  return (
    <div className="px-5 py-8 md:px-8 max-w-5xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div>
        <Link
          href={`/dashboard/websites/${form.website.id}`}
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {form.website.websiteName}
        </Link>

        {/* Form header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Form</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-[#09090b]">{form.formName}</h1>
            <p className="mt-1 text-sm text-[#71717a]">{form.website.websiteName} · {form.formType}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={form.status === "ACTIVE" ? "success" : "secondary"}>
              {form.status === "ACTIVE" ? "Active" : form.status}
            </Badge>
            <Link
              href={`/dashboard/forms/${form.id}?tab=settings`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
              style={{ background: "#f4f4f5", color: "#3f3f46" }}
            >
              <Settings2 className="h-3.5 w-3.5" />
              Edit
            </Link>
          </div>
        </div>
      </div>

      {/* Endpoint hero */}
      <div
        className="rounded-[28px] bg-white border border-[#ececee] p-5 sm:p-6"
        style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
      >
        <p className="text-xs font-medium text-[#a1a1aa] uppercase tracking-widest mb-3">Your form&apos;s address</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 text-xs sm:text-sm font-mono font-semibold text-[#09090b] bg-[#f4f4f5] px-3 sm:px-4 py-2.5 rounded-[14px] border border-[#ececee] overflow-hidden text-ellipsis whitespace-nowrap">
            {publicEndpoint}
          </code>
          <CopyButton text={publicEndpoint} className="shrink-0" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 divide-y divide-[#f4f4f5] sm:divide-y-0">
          <div className="flex items-center gap-2.5 pt-3 sm:pt-0 first:pt-0">
            <Mail className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
            <div className="min-w-0">
              <p className="text-xs text-[#a1a1aa]">Send to</p>
              <p className="text-xs font-semibold text-[#09090b] truncate">{form.recipientEmails.join(", ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-3 sm:pt-0">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
            <div>
              <p className="text-xs text-[#a1a1aa]">Spam filter</p>
              <p className="text-xs font-semibold text-[#09090b]">{form.spamProtectionLevel}</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 pt-3 sm:pt-0">
            <Tag className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
            <div>
              <p className="text-xs text-[#a1a1aa]">Messages received</p>
              <p className="text-xs font-semibold text-[#09090b]">{form.submissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Connect card — always visible, above tabs */}
      <ConnectCard
        publicEndpoint={publicEndpoint}
        htmlSnippet={htmlSnippet}
        honeypotFieldName={form.honeypotFieldName ?? "_hp_formrelay"}
        aiPrompt={aiPrompt}
      />

      {/* Platform picker */}
      <PlatformPicker
        aiPrompt={aiPrompt}
        publicEndpoint={publicEndpoint}
        honeypotFieldName={form.honeypotFieldName ?? "_hp_formrelay"}
      />

      {/* Tabs */}
      <FormTabs defaultValue={activeTab}>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-[#a1a1aa]">Total messages</p>
                  <p className="text-2xl font-black text-[#09090b] mt-0.5">{form.submissions.length}</p>
                </div>
                <div>
                  <p className="text-xs text-[#a1a1aa]">Last message</p>
                  <p className="text-sm font-semibold text-[#09090b] mt-0.5">
                    {latestSubmission
                      ? new Date(latestSubmission.createdAt).toLocaleDateString()
                      : "Never"}
                  </p>
                </div>
              </div>
              <Link
                href={`/dashboard/submissions?formId=${form.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#ececee] bg-white px-4 py-2 text-sm font-medium text-[#52525b] hover:bg-[#f4f4f5] transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View all messages for this form
              </Link>
            </CardContent>
          </Card>

          {form.submissions.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent messages</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#f4f4f5]">
                  {form.submissions.slice(0, 5).map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/dashboard/submissions/${sub.id}`}
                      className="flex items-start justify-between px-6 py-4 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#09090b]">
                          {sub.submitterName ?? "Unknown sender"}
                        </p>
                        <p className="text-xs text-[#a1a1aa]">{sub.submitterEmail ?? "No email"}</p>
                        <p className="text-xs text-[#71717a] mt-1.5 line-clamp-2">
                          {sub.messagePreview ?? "Submission stored."}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0">
                        <Badge
                          variant={
                            sub.spamStatus === "CLEAN"
                              ? "success"
                              : sub.spamStatus === "SUSPICIOUS"
                              ? "warning"
                              : "destructive"
                          }
                          className="text-xs"
                        >
                          {spamStatusLabel(sub.spamStatus)}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Settings tab */}
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Form settings</CardTitle>
              <CardDescription>
                Update the form name, recipient emails, and success redirect URL.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EntityForm
                action={updateFormInboxSettingsAction}
                submitLabel="Save settings"
                hiddenFields={{ formId: form.id }}
                fields={[
                  {
                    name: "formName",
                    label: "Form name",
                    placeholder: "Contact Form",
                    defaultValue: form.formName,
                    hint: "A label that identifies this form in your dashboard and email alerts.",
                  },
                  {
                    name: "recipientEmails",
                    label: "Recipient email(s)",
                    placeholder: "hello@mysite.com, sales@mysite.com",
                    defaultValue: form.recipientEmails.join(", "),
                    hint: "Comma-separated list. Submissions will be emailed to all addresses.",
                  },
                  {
                    name: "successRedirectUrl",
                    label: "Success redirect URL",
                    type: "url",
                    placeholder: "https://mysite.com/thank-you",
                    defaultValue: form.successRedirectUrl ?? "",
                    hint: "Optional. Where to redirect users after a successful submission.",
                    optional: true,
                  },
                ]}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spam & Filtering tab */}
        <TabsContent value="spam" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spam & Filtering</CardTitle>
              <CardDescription>
                Standard mode scores suspicious patterns without throwing away real leads. Use Strict only when under active attack.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Field Mapping tab */}
        <TabsContent value="mapping" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Field Mapping</CardTitle>
              <CardDescription>
                Tell FormRelay which field keys correspond to name, email, phone, and message. This powers sender info in email alerts and submission previews.
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                <div className="rounded-[20px] bg-[#f4f4f5] border border-dashed border-[#ececee] p-8 text-center">
                  <p className="text-sm font-semibold text-[#71717a]">No messages yet</p>
                  <p className="text-xs text-[#a1a1aa] mt-1">
                    Submit the form at least once and the detected field keys will appear here for mapping.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </FormTabs>
    </div>
  );
}
