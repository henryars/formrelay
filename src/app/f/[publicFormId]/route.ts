import { createHash } from "node:crypto";

import type { FormInbox, Prisma, Website, Workspace } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  buildEmailLogEntriesForSendResult,
  buildSuppressedEmailLogEntries,
} from "@/lib/email-delivery";
import { renderSubmissionEmail, sendSubmissionEmail } from "@/lib/email";
import {
  countTruthyFields,
  deriveFieldCandidates,
  deriveSubmissionSummary,
  getSubmissionShapeMetrics,
  hashIpAddress,
  parseSubmissionRequest,
} from "@/lib/form-submission";
import { prisma } from "@/lib/prisma";
import { assessSubmissionSpam, decideNotification } from "@/lib/spam";
import {
  createSubmissionFingerprint,
  evaluateRateLimits,
  inferRateSignals,
  isAllowedSubmissionSource,
  isFieldCountAllowed,
  isPayloadSizeAllowed,
  isTextValueLengthAllowed,
  isTotalTextLengthAllowed,
} from "@/lib/submission-security";

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

type FormWithWebsite = FormInbox & {
  website: Website & {
    workspace: Workspace;
  };
};

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function successResponse() {
  return NextResponse.json({
    success: true,
    message: "Submission received.",
  });
}

function blockedResponse(status: number, message = "Submission could not be processed.") {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status },
  );
}

async function logBlockedEvent(input: {
  form: FormWithWebsite | null;
  publicFormId: string;
  reason: string;
  ipHash: string | null;
  userAgent: string | null;
  originHeader: string | null;
  refererHeader: string | null;
  payloadSize: number | null;
  fieldCount?: number | null;
  contentType: string | null;
}) {
  await prisma.blockedEvent.create({
    data: {
      workspaceId: input.form?.website.workspace.id ?? null,
      websiteId: input.form?.website.id ?? null,
      formId: input.form?.id ?? null,
      publicFormId: input.publicFormId,
      reason: input.reason,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      originHeader: input.originHeader,
      refererHeader: input.refererHeader,
      payloadSize: input.payloadSize,
      fieldCount: input.fieldCount ?? null,
      contentType: input.contentType,
    },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ publicFormId: string }> },
) {
  const { publicFormId } = await params;
  const contentLengthHeader = request.headers.get("content-length");
  const contentType = request.headers.get("content-type");
  const originHeader = request.headers.get("origin");
  const refererHeader = request.headers.get("referer");
  const userAgent = request.headers.get("user-agent");
  const parsedPayloadSize = contentLengthHeader ? Number(contentLengthHeader) : null;
  const payloadSize =
    parsedPayloadSize !== null && Number.isFinite(parsedPayloadSize) ? parsedPayloadSize : null;
  const ipAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip");
  const ipHash = hashIpAddress(ipAddress ?? null);

  try {
    if (!isPayloadSizeAllowed(contentLengthHeader)) {
      await logBlockedEvent({
        form: null,
        publicFormId,
        reason: "PAYLOAD_TOO_LARGE",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        contentType,
      });
      return blockedResponse(413);
    }

    const form = await prisma.formInbox.findUnique({
      where: { publicFormId },
      include: {
        website: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!form || form.status !== "ACTIVE") {
      return NextResponse.json(
        {
          success: false,
          message: "This form endpoint is not active.",
        },
        { status: 404 },
      );
    }

    const submissionPayload = await parseSubmissionRequest(request);
    const fieldCount = countTruthyFields(submissionPayload.fields);
    const shapeMetrics = getSubmissionShapeMetrics(submissionPayload.fields);

    if (!isFieldCountAllowed(fieldCount)) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "FIELD_COUNT_TOO_HIGH",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return blockedResponse(422);
    }

    if (submissionPayload.containsFiles) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "FILES_NOT_ALLOWED",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return blockedResponse(422);
    }

    if (shapeMetrics.maxFieldKeyLength > 100) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "FIELD_KEY_TOO_LONG",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return blockedResponse(422);
    }

    if (shapeMetrics.maxJsonDepth > 10) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "JSON_TOO_DEEP",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return blockedResponse(422);
    }

    if (!isTotalTextLengthAllowed(shapeMetrics.totalTextLength)) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "TOTAL_TEXT_TOO_LARGE",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return blockedResponse(422);
    }

    if (
      shapeMetrics.hasOverlongValue ||
      shapeMetrics.flattenedValues.some((value) => !isTextValueLengthAllowed(value))
    ) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "FIELD_VALUE_TOO_LONG",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return blockedResponse(422);
    }

    const sourceTrust = isAllowedSubmissionSource({
      websiteUrl: form.website.websiteUrl,
      allowedDomains: form.website.allowedDomains,
      sourceUrl: submissionPayload.sourceUrl,
      referrer: submissionPayload.referrer ?? refererHeader,
      originHeader,
    });

    const summary = deriveSubmissionSummary(submissionPayload.fields, {
      nameFieldKey: form.nameFieldKey,
      emailFieldKey: form.emailFieldKey,
      phoneFieldKey: form.phoneFieldKey,
      messageFieldKey: form.messageFieldKey,
    });
    const payloadHash = createSubmissionFingerprint(submissionPayload.fields);
    const submissionFingerprint = payloadHash;
    const requestFingerprint = hashValue(
      [
        form.id,
        payloadHash,
        ipHash ?? "no-ip",
        userAgent ?? "no-agent",
        originHeader ?? "no-origin",
      ].join(":"),
    );
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const [
      ipCountLastMinute,
      ipCountLastHour,
      formCountLastTenMinutes,
      duplicateCountLastTwoMinutes,
      duplicateCountLastTenMinutes,
      sameIpManyFormsLastTenMinutes,
    ] =
      await Promise.all([
        ipHash
          ? prisma.submission.count({
              where: {
                formId: form.id,
                ipHash,
                createdAt: {
                  gte: oneMinuteAgo,
                },
              },
            })
          : Promise.resolve(0),
        ipHash
          ? prisma.submission.count({
              where: {
                formId: form.id,
                ipHash,
                createdAt: {
                  gte: oneHourAgo,
                },
              },
            })
          : Promise.resolve(0),
        prisma.submission.count({
          where: {
            formId: form.id,
            createdAt: {
              gte: tenMinutesAgo,
            },
          },
        }),
        prisma.submission.count({
          where: {
            formId: form.id,
            submissionFingerprint,
            createdAt: {
              gte: twoMinutesAgo,
            },
          },
        }),
        prisma.submission.count({
          where: {
            formId: form.id,
            submissionFingerprint,
            createdAt: {
              gte: tenMinutesAgo,
            },
          },
        }),
        ipHash
          ? prisma.submission
              .findMany({
                where: {
                  ipHash,
                  createdAt: {
                    gte: tenMinutesAgo,
                  },
                },
                distinct: ["formId"],
                select: {
                  formId: true,
                },
              })
              .then((records) => records.length)
          : Promise.resolve(0),
      ]);

    const rateLimitDecision = evaluateRateLimits({
      now,
      ipCountLastMinute,
      ipCountLastHour,
      formCountLastTenMinutes,
      duplicateCountLastTwoMinutes,
      duplicateCountLastTenMinutes,
      sameIpManyFormsLastTenMinutes,
    });

    if (!rateLimitDecision.allowed) {
      await logBlockedEvent({
        form,
        publicFormId,
        reason: "RATE_LIMIT_BLOCKED",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        fieldCount,
        contentType,
      });
      return NextResponse.json(
        {
          success: false,
          message: rateLimitDecision.message,
        },
        {
          status: rateLimitDecision.statusCode,
          headers: {
            "Retry-After": String(rateLimitDecision.retryAfterSeconds),
          },
        },
      );
    }

    const fieldCandidates = deriveFieldCandidates(submissionPayload.fieldItems);
    const rateReasons = inferRateSignals({
      ipCountLastMinute,
      duplicateCountLastTwoMinutes,
      duplicateCountLastTenMinutes,
      sameIpManyFormsLastTenMinutes,
    });
    const spamResult = assessSubmissionSpam({
      fields: submissionPayload.fields,
      fieldItems: submissionPayload.fieldItems,
      userAgent,
      sourceTrust: {
        allowedDomains: sourceTrust.allowedDomains,
        checkedDomains: sourceTrust.checkedDomains,
        matchedDomain: sourceTrust.matchedDomain,
        sourceUrl: submissionPayload.sourceUrl,
        originHeader,
        refererHeader: submissionPayload.referrer ?? refererHeader,
      },
      formType: form.formType,
      spamProtectionLevel: form.spamProtectionLevel,
      websiteProtectionMode: form.websiteProtectionMode,
      submitterName: summary.submitterName ?? undefined,
      submitterEmail: summary.submitterEmail ?? undefined,
      submitterPhone: summary.submitterPhone ?? undefined,
      messagePreview: summary.messagePreview ?? undefined,
      rateReasons,
      fieldCount,
      payloadSize,
      configuredHoneypotFieldName: form.honeypotFieldName,
    });
    const notificationDecision = decideNotification({
      spamStatus: spamResult.spamStatus,
      spamScore: spamResult.spamScore,
      spamBucket: spamResult.spamBucket,
      notifyOnLowSuspicious: form.notifyOnLowSuspicious,
      notifyOnSuspicious: form.notifyOnSuspicious,
      notifyOnSpam: form.notifyOnSpam,
    });

    const submission = await prisma.submission.create({
      data: {
        workspaceId: form.website.workspace.id,
        websiteId: form.website.id,
        formId: form.id,
        status: "NEW",
        spamStatus: spamResult.spamStatus,
        spamScore: spamResult.spamScore,
        spamBucket: spamResult.spamBucket,
        spamReasons: toInputJsonValue(spamResult.reasons),
        spamCheckedAt: now,
        notificationStatus: notificationDecision.notificationStatus,
        notificationSuppressedReason: notificationDecision.suppressedReason ?? null,
        submitterName: summary.submitterName,
        submitterEmail: summary.submitterEmail,
        submitterPhone: summary.submitterPhone,
        messagePreview: summary.messagePreview,
        rawFields: toInputJsonValue(submissionPayload.fields),
        fieldItems: toInputJsonValue(submissionPayload.fieldItems),
        sourceUrl: submissionPayload.sourceUrl,
        pageTitle: submissionPayload.pageTitle,
        originHeader,
        refererHeader: submissionPayload.referrer ?? refererHeader,
        referrer: submissionPayload.referrer ?? refererHeader,
        ipHash,
        userAgent,
        requestFingerprint,
        submissionFingerprint,
        payloadHash,
        metadata: toInputJsonValue({
          contentType,
          formName: submissionPayload.formName ?? form.formName,
          fieldCandidates,
          sourceTrust,
        }),
        spamEvents: {
          create: spamResult.reasons.map((reason) => ({
            reason: reason.label,
            scoreAdded: reason.score,
          })),
        },
      },
    });

    const subjectPrefix =
      spamResult.spamStatus === "SUSPICIOUS"
        ? "[Suspicious] "
        : spamResult.spamStatus === "SPAM"
          ? "[Spam review] "
          : "";
    const subject = `${subjectPrefix}New submission from ${form.formName} — ${form.website.websiteName}`;
    let emailLogData: Prisma.EmailLogCreateManyInput[] = [];
    let finalNotificationStatus = notificationDecision.notificationStatus;
    let finalSuppressedReason = notificationDecision.suppressedReason;

    if (notificationDecision.shouldNotify) {
      try {
        const emailResponse = await sendSubmissionEmail({
          to: form.recipientEmails,
          subject,
          replyTo: summary.submitterEmail,
          html: renderSubmissionEmail({
            websiteName: form.website.websiteName,
            formName: form.formName,
            fieldItems: submissionPayload.fieldItems,
            sourceUrl: submissionPayload.sourceUrl,
          }),
        });

        emailLogData = buildEmailLogEntriesForSendResult({
          submissionId: submission.id,
          intendedRecipients: form.recipientEmails,
          subject,
          sendResult: emailResponse,
        });
        finalNotificationStatus = emailResponse.skipped ? "NOT_APPLICABLE" : "SENT";
        finalSuppressedReason =
          emailResponse.suppressionReason ??
          (emailResponse.skipped ? emailResponse.skippedReason : undefined);
      } catch (error) {
        emailLogData = form.recipientEmails.map((recipientEmail) => ({
          submissionId: submission.id,
          recipientEmail: recipientEmail.toLowerCase(),
          emailSubject: subject,
          emailStatus: "FAILED" as const,
          errorMessage: error instanceof Error ? error.message : "Unknown email error",
        }));
        finalNotificationStatus = "FAILED";
        finalSuppressedReason =
          error instanceof Error ? error.message : "Notification delivery failed.";
      }
    } else {
      emailLogData = buildSuppressedEmailLogEntries({
        submissionId: submission.id,
        recipients: form.recipientEmails,
        subject,
        reason: notificationDecision.suppressedReason ?? "Submission notification was suppressed.",
      });
    }

    if (emailLogData.length) {
      await prisma.emailLog.createMany({
        data: emailLogData,
      });
    }

    await prisma.submission.update({
      where: {
        id: submission.id,
      },
      data: {
        notificationStatus: finalNotificationStatus,
        notificationSuppressedReason: finalSuppressedReason ?? null,
      },
    });

    return successResponse();
  } catch (error) {
    if (error instanceof Error && error.message === "Unsupported content type") {
      await logBlockedEvent({
        form: null,
        publicFormId,
        reason: "UNSUPPORTED_CONTENT_TYPE",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        contentType,
      });
      return blockedResponse(415);
    }

    if (error instanceof SyntaxError) {
      await logBlockedEvent({
        form: null,
        publicFormId,
        reason: "MALFORMED_JSON",
        ipHash,
        userAgent,
        originHeader,
        refererHeader,
        payloadSize,
        contentType,
      });
      return blockedResponse(400);
    }

    console.error(error);

    return blockedResponse(500, "We couldn't process this submission.");
  }
}
