import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { updateWebsiteAction } from "@/app/actions/forms";
import { EntityForm } from "@/components/entity-form";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

function tzOffset(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
    return offset || "GMT+0";
  } catch {
    return "";
  }
}

const TIMEZONES = Intl.supportedValuesOf("timeZone").map((tz) => ({
  label: `${tz} (${tzOffset(tz)})`,
  value: tz,
}));

export default async function EditWebsitePage({
  params,
}: {
  params: Promise<{ websiteId: string }>;
}) {
  const { workspace } = await requireWorkspace();
  const { websiteId } = await params;

  const website = await prisma.website.findFirst({
    where: { id: websiteId, workspaceId: workspace.id },
  });

  if (!website) notFound();

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/dashboard/websites/${website.id}`}
          className="inline-flex items-center gap-1 text-sm text-[#71717a] hover:text-[#09090b] transition-colors mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to {website.websiteName}
        </Link>
        <PageHeader
          label="Edit website"
          title={website.websiteName}
          description="Update your website details and default settings."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Website details</CardTitle>
          <CardDescription>
            Changes apply to all form inboxes under this website by default.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EntityForm
            action={updateWebsiteAction}
            submitLabel="Save changes"
            hiddenFields={{ websiteId: website.id }}
            fields={[
              {
                name: "websiteName",
                label: "Website name",
                placeholder: "My Restaurant Website",
                defaultValue: website.websiteName,
                hint: "A friendly name you'll recognise in the dashboard.",
              },
              {
                name: "websiteUrl",
                label: "Website URL",
                type: "url",
                placeholder: "https://mysite.com",
                defaultValue: website.websiteUrl,
                hint: "The domain where your forms are hosted.",
              },
              {
                name: "allowedDomains",
                label: "Allowed domains",
                placeholder: "mysite.com, www.mysite.com",
                defaultValue: website.allowedDomains.join(", "),
                hint: "Optional. Comma-separated domains allowed to submit to your forms.",
              },
              {
                name: "timezone",
                label: "Timezone",
                kind: "combobox",
                placeholder: "Search timezones…",
                defaultValue: website.timezone ?? "",
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
