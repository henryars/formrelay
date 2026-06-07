import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Globe, Mail, ShieldCheck, Tag, ExternalLink, Sparkles } from "lucide-react";

import { FieldMappingForm } from "@/components/field-mapping-form";
import { FormProtectionForm } from "@/components/form-protection-form";
import { env } from "@/lib/env";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { CopyButton } from "@/components/copy-button";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default async function FormDetailPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { formId } = await params;

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
  <!-- Honeypot (invisible to humans) -->
  <input name="${form.honeypotFieldName ?? "_hp_formrelay"}" tabindex="-1" autocomplete="off"
    style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" />
  <!-- Load timestamp (helps detect bots) -->
  <input type="hidden" name="_fr_loaded_at" />
  <button type="submit">Send message</button>
</form>
<script>
  const f = document.querySelector('input[name="_fr_loaded_at"]');
  if (f) f.value = String(Date.now());
</script>`;

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/websites/${form.website.id}`}
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          {form.website.websiteName}
        </Link>
        <PageHeader
          label="Form inbox"
          title={form.formName}
          description={`${form.website.websiteName} · ${form.formType}`}
        >
          <Badge variant={form.status === "ACTIVE" ? "success" : "secondary"}>
            {form.status}
          </Badge>
        </PageHeader>
      </div>

      {/* Endpoint hero */}
      <Card className="border-[#e4e4e7] bg-gradient-to-r from-[#fafafa] to-white">
        <CardContent className="p-5">
          <p className="text-xs font-medium text-[#71717a] uppercase tracking-widest mb-2">Endpoint URL</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm font-mono text-[#09090b] bg-[#f4f4f5] px-4 py-2.5 rounded-lg border border-[#e4e4e7] overflow-x-auto">
              {publicEndpoint}
            </code>
            <CopyButton text={publicEndpoint} className="shrink-0" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Recipients</p>
                <p className="text-xs font-medium text-[#09090b] truncate">{form.recipientEmails.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Spam protection</p>
                <p className="text-xs font-medium text-[#09090b]">{form.spamProtectionLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-[#a1a1aa]" />
              <div>
                <p className="text-xs text-[#a1a1aa]">Submissions</p>
                <p className="text-xs font-medium text-[#09090b]">{form.submissions.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="connect">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="connect">Connect</TabsTrigger>
          <TabsTrigger value="protection">Protection</TabsTrigger>
          <TabsTrigger value="mapping">Field mapping</TabsTrigger>
          <TabsTrigger value="submissions">
            Submissions
            {form.submissions.length > 0 && (
              <span className="ml-1.5 rounded-full bg-[#0098f2]/10 text-[#0098f2] px-1.5 py-0.5 text-xs">
                {form.submissions.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Connect tab */}
        <TabsContent value="connect" className="mt-4 space-y-4">
          {/* AI Prompt card */}
          <Card className="border-[#0098f2]/20 bg-gradient-to-br from-[#f0f8ff] to-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-[#0098f2]/10 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-[#0098f2]" />
                </div>
                <div>
                  <CardTitle className="text-base">Connect with AI</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Paste this prompt into Lovable, Replit, ChatGPT, or any AI tool to wire up your form automatically.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] text-[#e8e8e8] p-5 text-sm leading-6 font-mono whitespace-pre-wrap">
{`Please wire the form on this page to a custom backend endpoint.

Follow these requirements:
1. Update the form tag to use: action="${publicEndpoint}" and method="POST".
2. Ensure every input field (name, email, message, etc.) has a proper, unique name attribute matching its label.
3. Handle the submission state gracefully: prevent the default reload on submit, send the data via a fetch POST request, and display a clean "Thank you! Your message has been sent." success message in place of the form.`}
                </pre>
                <div className="absolute top-3 right-3">
                  <CopyButton text={`Please wire the form on this page to a custom backend endpoint.\n\nFollow these requirements:\n1. Update the form tag to use: action="${publicEndpoint}" and method="POST".\n2. Ensure every input field (name, email, message, etc.) has a proper, unique name attribute matching its label.\n3. Handle the submission state gracefully: prevent the default reload on submit, send the data via a fetch POST request, and display a clean "Thank you! Your message has been sent." success message in place of the form.`} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual setup */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Manual setup</CardTitle>
              <CardDescription>Choose your stack and copy the snippet directly.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="html">
                <TabsList>
                  <TabsTrigger value="html">HTML</TabsTrigger>
                  <TabsTrigger value="react">React</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
                <TabsContent value="html" className="mt-3 space-y-3">
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] text-[#e8e8e8] p-5 text-xs leading-6 font-mono">
                      {htmlSnippet}
                    </pre>
                    <div className="absolute top-3 right-3">
                      <CopyButton text={htmlSnippet} />
                    </div>
                  </div>
                  <p className="text-xs text-[#a1a1aa]">
                    The honeypot field must stay visually hidden. The <code className="bg-[#f4f4f5] px-1 rounded">_fr_loaded_at</code> field helps detect bot submissions.
                  </p>
                </TabsContent>
                <TabsContent value="react" className="mt-3 space-y-3">
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] text-[#e8e8e8] p-5 text-xs leading-6 font-mono">{`"use client";
import { useState, useRef } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (ref.current) ref.current.value = String(Date.now());
    await fetch("${publicEndpoint}", { method: "POST", body: data });
    setSent(true);
  }

  if (sent) return <p>Thank you! Your message has been sent.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Your email" required />
      <textarea name="message" placeholder="Your message" />
      {/* Honeypot */}
      <input name="${form.honeypotFieldName ?? "_hp_formrelay"}" tabIndex={-1}
        style={{ position: "absolute", left: -9999 }} />
      <input type="hidden" name="_fr_loaded_at" ref={ref} />
      <button type="submit">Send</button>
    </form>
  );
}`}</pre>
                    <div className="absolute top-3 right-3">
                      <CopyButton text={`"use client";\nimport { useState, useRef } from "react";\n\nexport function ContactForm() {\n  const [sent, setSent] = useState(false);\n  const ref = useRef<HTMLInputElement>(null);\n\n  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {\n    e.preventDefault();\n    const data = new FormData(e.currentTarget);\n    if (ref.current) ref.current.value = String(Date.now());\n    await fetch("${publicEndpoint}", { method: "POST", body: data });\n    setSent(true);\n  }\n\n  if (sent) return <p>Thank you! Your message has been sent.</p>;\n\n  return (\n    <form onSubmit={handleSubmit}>\n      <input name="name" placeholder="Your name" required />\n      <input name="email" type="email" placeholder="Your email" required />\n      <textarea name="message" placeholder="Your message" />\n      <input name="${form.honeypotFieldName ?? "_hp_formrelay"}" tabIndex={-1} style={{ position: "absolute", left: -9999 }} />\n      <input type="hidden" name="_fr_loaded_at" ref={ref} />\n      <button type="submit">Send</button>\n    </form>\n  );\n}`} />
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="other" className="mt-3 space-y-3">
                  <p className="text-sm text-[#52525b]">
                    Any tool that can send an HTTP <code className="bg-[#f4f4f5] px-1 rounded text-xs">POST</code> request with form-encoded data works with FormRelay.
                  </p>
                  <div className="relative">
                    <pre className="overflow-x-auto rounded-lg bg-[#1a1a1a] text-[#e8e8e8] p-5 text-xs leading-6 font-mono">{`# curl example
curl -X POST "${publicEndpoint}" \\
  -F "name=Jane Doe" \\
  -F "email=jane@example.com" \\
  -F "message=Hello from curl"`}</pre>
                    <div className="absolute top-3 right-3">
                      <CopyButton text={`curl -X POST "${publicEndpoint}" \\\n  -F "name=Jane Doe" \\\n  -F "email=jane@example.com" \\\n  -F "message=Hello from curl"`} />
                    </div>
                  </div>
                  <p className="text-xs text-[#a1a1aa]">Works with Webflow, Framer, Bubble, Make, Zapier webhooks, and any fetch/axios call.</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Test your connection</CardTitle>
              <CardDescription>After adding the snippet, submit the form and check your inbox.</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm text-[#52525b]">
                {[
                  "Add the snippet to your website's HTML",
                  "Fill in and submit your form",
                  "Check this page's Submissions tab for the incoming entry",
                  "Check the recipient email for the notification",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="h-5 w-5 rounded-full bg-[#f4f4f5] text-[#71717a] text-xs flex items-center justify-center shrink-0 font-medium mt-0.5">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <Separator className="my-4" />
              <Link href={`/dashboard/submissions?formId=${form.id}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  View all submissions for this form
                </Button>
              </Link>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protection tab */}
        <TabsContent value="protection" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spam & protection settings</CardTitle>
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

        {/* Field mapping tab */}
        <TabsContent value="mapping" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Field mapping</CardTitle>
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
                <div className="rounded-lg bg-[#fafafa] border border-dashed border-[#e4e4e7] p-8 text-center">
                  <p className="text-sm font-medium text-[#71717a]">No submissions yet</p>
                  <p className="text-xs text-[#a1a1aa] mt-1">
                    Submit the form at least once and the detected field keys will appear here for mapping.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Submissions tab */}
        <TabsContent value="submissions" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Recent submissions</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {form.submissions.length ? (
                <div className="divide-y divide-[#f4f4f5]">
                  {form.submissions.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/dashboard/submissions/${sub.id}`}
                      className="flex items-start justify-between px-6 py-4 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#09090b]">
                          {sub.submitterName ?? "Unknown sender"}
                        </p>
                        <p className="text-xs text-[#a1a1aa]">{sub.submitterEmail ?? "No email"}</p>
                        <p className="text-xs text-[#71717a] mt-1.5 line-clamp-2">
                          {sub.messagePreview ?? "Submission stored."}
                        </p>
                      </div>
                      <div className="ml-4 shrink-0">
                        <Badge
                          variant={sub.spamStatus === "CLEAN" ? "success" : sub.spamStatus === "SUSPICIOUS" ? "warning" : "destructive"}
                          className="text-xs"
                        >
                          {sub.spamStatus}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-[#a1a1aa]">No submissions yet. Connect the form and send a test.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
