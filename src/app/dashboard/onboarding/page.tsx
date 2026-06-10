import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const { workspace } = await requireWorkspace();

  const [websites, formCount, submissionCount] = await Promise.all([
    prisma.website.findMany({
      where: { workspaceId: workspace.id },
      select: { id: true, websiteName: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.formInbox.count({ where: { website: { workspaceId: workspace.id } } }),
    prisma.submission.count({ where: { workspaceId: workspace.id } }),
  ]);

  return (
    <OnboardingWizard
      websites={websites}
      formCount={formCount}
      submissionCount={submissionCount}
    />
  );
}
