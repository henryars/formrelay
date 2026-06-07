import { cache } from "react";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const getDashboardData = cache(async () => {
  const { user, workspace } = await requireWorkspace();

  const [websites, forms, submissions, spamCount, recentSubmissions] = await Promise.all([
    prisma.website.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: {
        forms: {
          include: {
            _count: {
              select: {
                submissions: true,
              },
            },
          },
        },
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    }),
    prisma.formInbox.findMany({
      where: {
        website: {
          workspaceId: workspace.id,
        },
      },
      orderBy: { createdAt: "desc" },
      include: {
        website: true,
        _count: {
          select: {
            submissions: true,
          },
        },
      },
    }),
    prisma.submission.count({
      where: { workspaceId: workspace.id },
    }),
    prisma.submission.count({
      where: {
        workspaceId: workspace.id,
        spamStatus: "SPAM",
      },
    }),
    prisma.submission.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        website: true,
        form: true,
      },
    }),
  ]);

  return {
    user,
    workspace,
    websites,
    forms,
    submissions,
    spamCount,
    recentSubmissions,
  };
});
