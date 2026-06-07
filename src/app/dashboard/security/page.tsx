import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { workspace } = await requireWorkspace();

  const [blockedEvents, emailSuppressions, deliveryEvents] = await Promise.all([
    prisma.blockedEvent.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
      include: {
        form: true,
        website: true,
      },
    }),
    prisma.emailSuppression.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 25,
    }),
    prisma.emailDeliveryEvent.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 25,
    }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Security events</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Hard-blocked abuse stays out of the submission table.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-8 text-charcoal-whisper">
          We only put infrastructure abuse here: oversized payloads, malformed requests, disabled
          endpoints, unsupported content types, and rate-limit spikes.
        </p>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="grid gap-4">
        {blockedEvents.length ? (
          blockedEvents.map((event) => (
            <article key={event.id} className="rounded-[20px] bg-white p-6 shadow-subtle">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-medium text-invoice-blue">{event.reason}</p>
                  <h2 className="mt-2 text-xl font-semibold text-midnight-ink">
                    {event.form?.formName ?? event.publicFormId ?? "Unknown form endpoint"}
                  </h2>
                  <p className="mt-2 text-sm text-graphite-mute">
                    {event.website?.websiteName ?? "Unknown website"}
                  </p>
                </div>
                <span className="rounded-full bg-cool-mist px-3 py-1 text-xs text-midnight-ink">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(event.createdAt)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 text-sm text-charcoal-whisper md:grid-cols-2">
                <p>Content type: {event.contentType ?? "Not captured"}</p>
                <p>Field count: {event.fieldCount ?? "Not captured"}</p>
                <p>Payload size: {event.payloadSize ?? "Not captured"}</p>
                <p>Origin: {event.originHeader ?? "Missing"}</p>
                <p>Referrer: {event.refererHeader ?? "Missing"}</p>
                <p>User agent: {event.userAgent ?? "Missing"}</p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-[20px] bg-white p-6 shadow-subtle text-charcoal-whisper">
            No blocked events yet. When abusive requests hit a form endpoint, they’ll be logged here
            without being stored as submissions.
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-invoice-blue">Suppressed recipients</p>
              <h2 className="mt-2 text-2xl font-semibold text-midnight-ink">
                SES bounce and complaint protections
              </h2>
            </div>
            <span className="rounded-full bg-cool-mist px-3 py-1 text-xs text-midnight-ink">
              {emailSuppressions.length} tracked
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {emailSuppressions.length ? (
              emailSuppressions.map((suppression) => (
                <article key={suppression.id} className="rounded-2xl border border-cool-mist p-4">
                  <p className="text-sm font-semibold text-midnight-ink">
                    {suppression.recipientEmail}
                  </p>
                  <p className="mt-1 text-sm text-charcoal-whisper">
                    {suppression.reason} via {suppression.source}
                  </p>
                  <p className="mt-2 text-xs text-graphite-mute">
                    {suppression.detail ?? "No extra SES detail captured."}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-charcoal-whisper">
                No SES suppressions yet. Bounce and complaint events will appear here once the SES
                webhook is connected.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-[20px] bg-white p-6 shadow-subtle">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-invoice-blue">Delivery events</p>
              <h2 className="mt-2 text-2xl font-semibold text-midnight-ink">
                Recent SES webhook activity
              </h2>
            </div>
            <span className="rounded-full bg-cool-mist px-3 py-1 text-xs text-midnight-ink">
              {deliveryEvents.length} recent
            </span>
          </div>

          <div className="mt-5 grid gap-3">
            {deliveryEvents.length ? (
              deliveryEvents.map((event) => (
                <article key={event.id} className="rounded-2xl border border-cool-mist p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-midnight-ink">{event.recipientEmail}</p>
                    <span className="rounded-full bg-cool-mist px-2 py-1 text-[11px] text-midnight-ink">
                      {event.eventType}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-charcoal-whisper">
                    {event.detail ?? "No event detail captured."}
                  </p>
                </article>
              ))
            ) : (
              <p className="text-sm text-charcoal-whisper">
                No SES delivery events yet. After you point SNS to the webhook endpoint, deliveries,
                bounces, and complaints will show up here.
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
