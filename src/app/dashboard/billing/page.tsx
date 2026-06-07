import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { workspace } = await requireWorkspace();

  return (
    <main className="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Billing</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Billing scaffold for {workspace.workspaceName}
        </h1>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-8 shadow-subtle text-charcoal-whisper">
        Billing is intentionally scaffolded but not connected yet. The next production step here is
        plan selection, subscription state sync, and usage enforcement.
      </section>
    </main>
  );
}
