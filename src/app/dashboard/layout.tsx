import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, workspace } = await requireWorkspace();

  const [websiteCount, formCount, submissionCount] = await Promise.all([
    prisma.website.count({ where: { workspaceId: workspace.id } }),
    prisma.formInbox.count({ where: { website: { workspaceId: workspace.id } } }),
    prisma.submission.count({ where: { workspaceId: workspace.id } }),
  ]);

  const setupProgress = (websiteCount > 0 ? 1 : 0) + (formCount > 0 ? 1 : 0) + (submissionCount > 0 ? 1 : 0);
  const onboardingComplete = setupProgress === 3;

  return (
    <div className="flex min-h-screen bg-[#f4f4f5]">
      <Sidebar
        workspaceName={workspace.workspaceName}
        userEmail={user.email}
        onboardingComplete={onboardingComplete}
        setupProgress={setupProgress}
      />
      {/* md:ml-[220px] matches sidebar width; pt-14 accounts for mobile top bar; pb-16 for mobile bottom nav */}
      <main className="flex-1 overflow-y-auto pt-14 pb-16 md:ml-[220px] md:pt-0 md:pb-0">
        {children}
      </main>
    </div>
  );
}
