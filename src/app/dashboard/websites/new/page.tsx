import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { createWebsiteAction } from "@/app/actions/forms";
import { EntityForm } from "@/components/entity-form";
import { requireWorkspace } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

function tzOffset(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return offset.replace("GMT", "GMT") || "GMT+0";
  } catch {
    return "";
  }
}

const TIMEZONES = Intl.supportedValuesOf("timeZone").map((tz) => ({
  label: `${tz} (${tzOffset(tz)})`,
  value: tz,
}));

export const dynamic = "force-dynamic";

export default async function NewWebsitePage() {
  await requireWorkspace();

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href="/dashboard/websites"
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to websites
        </Link>
        <PageHeader
          label="Add website"
          title="Register a new website"
          description="The website you want to receive form submissions for. Each website can have multiple form inboxes."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Website details</CardTitle>
          <CardDescription>
            These settings apply to all form inboxes under this website by default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm
            action={createWebsiteAction}
            submitLabel="Create website"
            fields={[
              {
                name: "websiteName",
                label: "Website name",
                placeholder: "My Restaurant Website",
                hint: "A friendly name you'll recognise in the dashboard.",
              },
              {
                name: "websiteUrl",
                label: "Website URL",
                type: "url",
                placeholder: "mysite.com",
                hint: "The domain where your forms are hosted. https:// is added automatically.",
              },
              {
                name: "defaultRecipientEmails",
                label: "Notification email(s)",
                placeholder: "hello@mysite.com, team@mysite.com",
                hint: "Comma-separated. Where submissions are emailed by default.",
              },
              {
                name: "allowedDomains",
                label: "Allowed domains",
                placeholder: "mysite.com, www.mysite.com",
                hint: "Optional. Comma-separated domains that are allowed to submit to your forms.",
              },
              {
                name: "timezone",
                label: "Timezone",
                kind: "combobox",
                placeholder: "Search timezones…",
                options: TIMEZONES,
                hint: "Optional. Used for timestamping submissions in email alerts.",
              },
            ]}
          />
        </CardContent>
      </Card>
    </div>
  );
}
