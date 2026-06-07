import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { createSubmissionCsv } from "@/lib/csv";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      workspaces: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  const workspace = user?.workspaces[0];

  if (!workspace) {
    return new NextResponse("Workspace not found", { status: 404 });
  }

  const submissions = await prisma.submission.findMany({
    where: {
      workspaceId: workspace.id,
      spamStatus: {
        in: ["CLEAN", "SUSPICIOUS"],
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      website: true,
      form: true,
    },
  });

  const csv = createSubmissionCsv(submissions);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="formrelay-submissions.csv"',
    },
  });
}
