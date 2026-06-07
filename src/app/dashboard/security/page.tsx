import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SecurityPage() {
  const { workspace } = await requireWorkspace();

  const blockedEvents = await prisma.blockedEvent.findMany({
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
  });

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
    </main>
  );
}
