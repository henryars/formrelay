"use server";

import type { NotificationStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { requireWorkspace } from "@/lib/auth";
import { buildEmailLogEntriesForSendResult } from "@/lib/email-delivery";
import { renderSubmissionEmail, sendSubmissionEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { parseFieldItems } from "@/lib/submission-json";

export type SubmissionActionState = {
  error?: string;
  message?: string;
};

const submissionStatusSchema = z.object({
  submissionId: z.string().min(1),
  status: z.enum(["NEW", "CONTACTED", "WON", "LOST", "ARCHIVED"]),
});

const submissionSpamReviewSchema = z.object({
  submissionId: z.string().min(1),
  action: z.enum(["MARKED_SPAM", "MARKED_NOT_SPAM"]),
  sendNotificationNow: z.enum(["true", "false"]).optional(),
});

export async function updateSubmissionStatusAction(
  _prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const { workspace } = await requireWorkspace();

  const parsed = submissionStatusSchema.safeParse({
    submissionId: formData.get("submissionId"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid status update",
    };
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: parsed.data.submissionId,
      workspaceId: workspace.id,
    },
  });

  if (!submission) {
    return {
      error: "Submission not found",
    };
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      status: parsed.data.status,
    },
  });

  return {
    message: "Submission status updated.",
  };
}

export async function reviewSubmissionSpamAction(
  _prevState: SubmissionActionState,
  formData: FormData,
): Promise<SubmissionActionState> {
  const { workspace } = await requireWorkspace();

  const parsed = submissionSpamReviewSchema.safeParse({
    submissionId: formData.get("submissionId"),
    action: formData.get("action"),
    sendNotificationNow: formData.get("sendNotificationNow") ?? "false",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Invalid spam review request",
    };
  }

  const submission = await prisma.submission.findFirst({
    where: {
      id: parsed.data.submissionId,
      workspaceId: workspace.id,
    },
    include: {
      form: true,
      website: true,
    },
  });

  if (!submission) {
    return {
      error: "Submission not found",
    };
  }

  await prisma.spamFeedback.create({
    data: {
      submissionId: submission.id,
      formId: submission.formId,
      workspaceId: workspace.id,
      action: parsed.data.action,
      previousSpamScore: submission.spamScore,
      previousClassification: submission.spamStatus,
    },
  });

  if (parsed.data.action === "MARKED_SPAM") {
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        spamStatus: "SPAM",
        spamBucket: "SPAM",
        spamScore: Math.max(submission.spamScore, 75),
        notificationStatus: "SUPPRESSED_SPAM",
        notificationSuppressedReason: "Submission was manually marked as spam.",
      },
    });

    return {
      message: "Submission moved to spam.",
    };
  }

  let notificationStatus: NotificationStatus = "NOT_APPLICABLE";
  let notificationSuppressedReason: string | null = null;
  let emailLogData: Prisma.EmailLogCreateManyInput[] = [];

  if (parsed.data.sendNotificationNow === "true") {
    const subject = `Recovered submission from ${submission.form.formName} — ${submission.website.websiteName}`;

    try {
      const emailResponse = await sendSubmissionEmail({
        to: submission.form.recipientEmails,
        subject,
        replyTo: submission.submitterEmail ?? undefined,
        html: renderSubmissionEmail({
          websiteName: submission.website.websiteName,
          formName: submission.form.formName,
          fieldItems: parseFieldItems(submission.fieldItems).map((item) => ({
            label: item.label ?? item.key ?? "Field",
            value: item.value ?? "",
          })),
          sourceUrl: submission.sourceUrl,
        }),
      });

      emailLogData = buildEmailLogEntriesForSendResult({
        submissionId: submission.id,
        intendedRecipients: submission.form.recipientEmails,
        subject,
        sendResult: emailResponse,
      });

      notificationStatus = emailResponse.skipped ? "NOT_APPLICABLE" : "SENT";
      notificationSuppressedReason =
        emailResponse.suppressionReason ??
        (emailResponse.skipped ? emailResponse.skippedReason ?? null : null);
    } catch (error) {
      emailLogData = submission.form.recipientEmails.map((recipientEmail) => ({
        submissionId: submission.id,
        recipientEmail: recipientEmail.toLowerCase(),
        emailSubject: subject,
        emailStatus: "FAILED" as const,
        errorMessage: error instanceof Error ? error.message : "Unknown email error",
      }));
      notificationStatus = "FAILED";
      notificationSuppressedReason =
        error instanceof Error ? error.message : "Recovered notification failed.";
    }
  }

  await prisma.submission.update({
    where: { id: submission.id },
    data: {
      spamStatus: "CLEAN",
      spamBucket: "INBOX",
      spamScore: Math.min(submission.spamScore, 39),
      notificationStatus,
      notificationSuppressedReason,
    },
  });

  if (emailLogData.length) {
    await prisma.emailLog.createMany({
      data: emailLogData,
    });
  }

  return {
    message:
      parsed.data.sendNotificationNow === "true"
        ? "Submission moved to inbox and notification processed."
        : "Submission moved to inbox.",
  };
}
