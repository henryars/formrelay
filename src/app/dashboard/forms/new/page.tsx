import Link from "next/link";
import { ChevronLeft, Globe, ArrowRight } from "lucide-react";

import { createFormInboxAction } from "@/app/actions/forms";
import { EntityForm } from "@/components/entity-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function NewFormPage({
  searchParams,
}: {
  searchParams: Promise<{ websiteId?: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { websiteId } = await searchParams;

  const websites = await prisma.website.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { websiteName: "asc" },
  });

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/forms"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to forms
        </Link>
        <PageHeader
          label="New form inbox"
          title="Create a form inbox"
          description="Each inbox generates a unique endpoint URL. Paste it into your HTML form's action attribute and submissions start flowing."
        />
      </div>

      {websites.length === 0 ? (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#a1a1aa]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b]">No websites yet</p>
              <p className="text-sm text-[#71717a] mt-1">
                You need to register a website before creating a form inbox.
              </p>
            </div>
            <Link href="/dashboard/websites/new">
              <Button className="gap-1.5">
                Add a website first <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Form inbox details</CardTitle>
            <CardDescription>
              Choose the website, set the recipient emails, and configure spam protection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EntityForm
              action={createFormInboxAction}
              submitLabel="Create form inbox"
              fields={[
                {
                  name: "websiteId",
                  label: "Website",
                  kind: "select",
                  options: websites.map((w) => ({
                    label: w.websiteName,
                    value: w.id,
                  })),
                },
                {
                  name: "formName",
                  label: "Form name",
                  placeholder: "Contact Form",
                  hint: "A label that identifies this form in your dashboard and email alerts.",
                },
                {
                  name: "recipientEmails",
                  label: "Recipient email(s)",
                  placeholder: "hello@mysite.com, sales@mysite.com",
                  hint: "Comma-separated list. Submissions will be emailed to all addresses.",
                },
                {
                  name: "successRedirectUrl",
                  label: "Success redirect URL",
                  type: "url",
                  placeholder: "https://mysite.com/thank-you",
                  hint: "Where to redirect users after a successful submission.",
                  optional: true,
                },
                {
                  name: "spamProtectionLevel",
                  label: "Spam protection level",
                  kind: "select",
                  options: [
                    { label: "Relaxed — fewer false positives", value: "RELAXED" },
                    { label: "Standard — recommended", value: "STANDARD" },
                    { label: "Strict — active attacks only", value: "STRICT" },
                  ],
                },
                {
                  name: "websiteProtectionMode",
                  label: "Website protection mode",
                  kind: "select",
                  options: [
                    { label: "Standard", value: "STANDARD" },
                    { label: "Open — no origin check", value: "OPEN" },
                    { label: "Strict — exact domain match", value: "STRICT" },
                  ],
                },
                {
                  name: "formType",
                  label: "Form type",
                  kind: "select",
                  options: [
                    { label: "Contact form", value: "CONTACT" },
                    { label: "Quote request", value: "QUOTE_REQUEST" },
                    { label: "Newsletter signup", value: "NEWSLETTER" },
                    { label: "Booking enquiry", value: "BOOKING_ENQUIRY" },
                    { label: "Waitlist", value: "WAITLIST" },
                    { label: "Other", value: "OTHER" },
                  ],
                },
              ]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
