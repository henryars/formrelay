import { AccountSettingsForm } from "@/components/account-settings-form";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireWorkspace } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, workspace } = await requireWorkspace();

  return (
    <main className="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-6 py-10 md:px-8">
      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <p className="text-sm font-medium text-invoice-blue">Settings</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
          Account and workspace settings
        </h1>
        <div className="mt-6">
          <DashboardNav />
        </div>
      </section>

      <section className="rounded-[20px] bg-white p-8 shadow-subtle">
        <AccountSettingsForm
          fullName={user.fullName}
          workspaceName={workspace.workspaceName}
          email={user.email}
        />
      </section>
    </main>
  );
}
