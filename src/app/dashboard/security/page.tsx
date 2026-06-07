import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/page-header";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

const fmt = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export default async function SecurityPage() {
  const { workspace } = await requireWorkspace();

  const [blockedEvents, emailSuppressions, deliveryEvents] = await Promise.all([
    prisma.blockedEvent.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { form: true, website: true },
    }),
    prisma.emailSuppression.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { updatedAt: "desc" },
      take: 25,
    }),
    prisma.emailDeliveryEvent.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 25,
    }),
  ]);

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
      <PageHeader
        label="Security"
        title="Security & delivery"
        description="Hard-blocked abuse events, SES bounces, and delivery activity."
      />

      {/* Blocked events */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Blocked requests</CardTitle>
              <CardDescription className="mt-1">
                Oversized payloads, malformed requests, rate-limit spikes, and disabled endpoints.
              </CardDescription>
            </div>
            <Badge variant="secondary">{blockedEvents.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {blockedEvents.length ? (
            <div className="divide-y divide-[#f4f4f5]">
              {blockedEvents.map((event) => (
                <div key={event.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-[#09090b]">
                        {event.form?.formName ?? event.publicFormId ?? "Unknown endpoint"}
                      </p>
                      <p className="text-xs text-[#a1a1aa] mt-0.5">
                        {event.website?.websiteName} · {event.reason}
                      </p>
                    </div>
                    <p className="text-xs text-[#a1a1aa] shrink-0">{fmt.format(event.createdAt)}</p>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-[#71717a]">
                    {event.contentType && <span>Type: {event.contentType}</span>}
                    {event.payloadSize && <span>Size: {event.payloadSize}</span>}
                    {event.originHeader && <span>Origin: {event.originHeader}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-[#a1a1aa]">No blocked events yet.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Suppressed recipients */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Suppressed recipients</CardTitle>
              <Badge variant="secondary">{emailSuppressions.length}</Badge>
            </div>
            <CardDescription>SES bounce and complaint protections.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {emailSuppressions.length ? (
              <div className="divide-y divide-[#f4f4f5]">
                {emailSuppressions.map((s) => (
                  <div key={s.id} className="px-6 py-3.5">
                    <p className="text-sm font-medium text-[#09090b]">{s.recipientEmail}</p>
                    <p className="text-xs text-[#71717a] mt-0.5">{s.reason} via {s.source}</p>
                    {s.detail && <p className="text-xs text-[#a1a1aa] mt-1">{s.detail}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-6 text-center">
                <p className="text-sm text-[#a1a1aa]">No suppressions yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delivery events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Delivery events</CardTitle>
              <Badge variant="secondary">{deliveryEvents.length}</Badge>
            </div>
            <CardDescription>Recent SES webhook activity.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {deliveryEvents.length ? (
              <div className="divide-y divide-[#f4f4f5]">
                {deliveryEvents.map((e) => (
                  <div key={e.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="text-sm text-[#09090b]">{e.recipientEmail}</p>
                      {e.detail && <p className="text-xs text-[#a1a1aa] mt-0.5">{e.detail}</p>}
                    </div>
                    <Badge
                      variant={e.eventType === "DELIVERY" ? "success" : e.eventType === "BOUNCE" ? "destructive" : "secondary"}
                      className="text-xs shrink-0 ml-3"
                    >
                      {e.eventType}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-6 text-center">
                <p className="text-sm text-[#a1a1aa]">No delivery events yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
