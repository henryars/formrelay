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

  const onboardingComplete = websiteCount > 0 && formCount > 0 && submissionCount > 0;

  return (
    <div className="flex min-h-screen bg-[#f7f8fa]">
      <Sidebar
        workspaceName={workspace.workspaceName}
        userEmail={user.email}
        onboardingComplete={onboardingComplete}
      />
      {/* md:ml-64 matches the sidebar width; pt-14 md:pt-0 accounts for mobile top bar */}
      <main className="flex-1 overflow-y-auto pt-14 md:ml-64 md:pt-0">
        {children}
      </main>
    </div>
  );
}
