import { createVerify } from "node:crypto";

import { type EmailDeliveryEventType, Prisma } from "@prisma/client";

import type { SendEmailResult } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

type SnsMessageType = "Notification" | "SubscriptionConfirmation" | "UnsubscribeConfirmation";

type SnsEnvelope = {
  Type: SnsMessageType;
  MessageId: string;
  TopicArn: string;
  Subject?: string;
  Message: string;
  Timestamp: string;
  SignatureVersion: string;
  Signature: string;
  SigningCertURL: string;
  SubscribeURL?: string;
  Token?: string;
};

type SesMailPayload = {
  timestamp?: string;
  messageId?: string;
  destination?: string[];
};

type SesBouncePayload = {
  bounceType?: string;
  bounceSubType?: string;
  bouncedRecipients?: Array<{
    emailAddress?: string;
    status?: string;
    action?: string;
    diagnosticCode?: string;
  }>;
};

type SesComplaintPayload = {
  complaintFeedbackType?: string;
  complainedRecipients?: Array<{
    emailAddress?: string;
  }>;
};

type SesDeliveryPayload = {
  recipients?: string[];
  timestamp?: string;
  smtpResponse?: string;
};

type SesNotificationPayload = {
  notificationType?: string;
  mail?: SesMailPayload;
  bounce?: SesBouncePayload;
  complaint?: SesComplaintPayload;
  delivery?: SesDeliveryPayload;
};

type NormalizedSesEvent = {
  eventKey: string;
  recipientEmail: string;
  eventType: EmailDeliveryEventType;
  sesMessageId?: string;
  sesEventId?: string;
  topicArn?: string;
  detail?: string;
  rawPayload: Prisma.InputJsonValue;
  mailTimestamp?: Date;
  eventTimestamp?: Date;
};

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase();
}

function uniqueEmails(addresses: string[]) {
  return [...new Set(addresses.map(normalizeEmailAddress).filter(Boolean))];
}

function uniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function parseTimestamp(value?: string) {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function allowedTopicArns() {
  return (env.AWS_SES_WEBHOOK_TOPIC_ARNS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function assertTopicAllowed(topicArn: string) {
  const allowed = allowedTopicArns();

  if (!allowed.length) {
    return;
  }

  if (!allowed.includes(topicArn)) {
    throw new Error(`Unexpected SNS topic ARN: ${topicArn}`);
  }
}

function buildNotificationStringToSign(envelope: SnsEnvelope) {
  const lines = [
    "Message",
    envelope.Message,
    "MessageId",
    envelope.MessageId,
  ];

  if (envelope.Subject) {
    lines.push("Subject", envelope.Subject);
  }

  lines.push("Timestamp", envelope.Timestamp, "TopicArn", envelope.TopicArn, "Type", envelope.Type);
  return `${lines.join("\n")}\n`;
}

function buildSubscriptionStringToSign(envelope: SnsEnvelope) {
  const lines = [
    "Message",
    envelope.Message,
    "MessageId",
    envelope.MessageId,
    "SubscribeURL",
    envelope.SubscribeURL ?? "",
    "Timestamp",
    envelope.Timestamp,
    "Token",
    envelope.Token ?? "",
    "TopicArn",
    envelope.TopicArn,
    "Type",
    envelope.Type,
  ];

  return `${lines.join("\n")}\n`;
}

function isAllowedSigningCertUrl(url: string) {
  try {
    const parsed = new URL(url);
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".amazonaws.com") &&
      parsed.pathname.endsWith(".pem")
    );
  } catch {
    return false;
  }
}

export async function verifySnsEnvelope(envelope: SnsEnvelope) {
  if (!isAllowedSigningCertUrl(envelope.SigningCertURL)) {
    throw new Error("SNS signing certificate URL is invalid.");
  }

  const stringToSign =
    envelope.Type === "Notification"
      ? buildNotificationStringToSign(envelope)
      : buildSubscriptionStringToSign(envelope);

  const certificateResponse = await fetch(envelope.SigningCertURL, {
    cache: "no-store",
  });

  if (!certificateResponse.ok) {
    throw new Error(`Unable to fetch SNS signing certificate: ${certificateResponse.status}`);
  }

  const certificate = await certificateResponse.text();
  const algorithm = envelope.SignatureVersion === "2" ? "RSA-SHA256" : "RSA-SHA1";
  const verifier = createVerify(algorithm);
  verifier.update(stringToSign, "utf8");
  verifier.end();

  const valid = verifier.verify(certificate, envelope.Signature, "base64");

  if (!valid) {
    throw new Error("SNS signature validation failed.");
  }
}

export async function confirmSnsSubscription(envelope: SnsEnvelope) {
  if (!envelope.SubscribeURL) {
    throw new Error("SNS subscription confirmation is missing SubscribeURL.");
  }

  const response = await fetch(envelope.SubscribeURL, {
    method: "GET",
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`SNS subscription confirmation failed with ${response.status}.`);
  }
}

function buildEventKey(input: {
  eventType: string;
  recipientEmail: string;
  sesMessageId?: string;
  sesEventId?: string;
  timestamp?: string;
}) {
  return [
    input.eventType,
    normalizeEmailAddress(input.recipientEmail),
    input.sesMessageId ?? "no-message-id",
    input.sesEventId ?? "no-event-id",
    input.timestamp ?? "no-timestamp",
  ].join(":");
}

function extractSesEvents(notification: SesNotificationPayload, topicArn: string): NormalizedSesEvent[] {
  const messageId = notification.mail?.messageId;
  const mailTimestamp = parseTimestamp(notification.mail?.timestamp);
  const eventType = notification.notificationType;
  const rawPayload = toInputJsonValue(notification);

  if (eventType === "Bounce") {
    return (
      notification.bounce?.bouncedRecipients?.flatMap((recipient) => {
        const recipientEmail = recipient.emailAddress ? normalizeEmailAddress(recipient.emailAddress) : "";
        if (!recipientEmail) {
          return [];
        }

        const detailParts = [
          notification.bounce?.bounceType,
          notification.bounce?.bounceSubType,
          recipient.status,
          recipient.action,
          recipient.diagnosticCode,
        ].filter(Boolean);

        return [
          {
            eventKey: buildEventKey({
              eventType: "BOUNCE",
              recipientEmail,
              sesMessageId: messageId,
              sesEventId: undefined,
              timestamp: notification.mail?.timestamp,
            }),
            recipientEmail,
            eventType: "BOUNCE",
            sesMessageId: messageId,
            topicArn,
            detail: detailParts.join(" | "),
            rawPayload,
            mailTimestamp,
            eventTimestamp: mailTimestamp,
          },
        ];
      }) ?? []
    );
  }

  if (eventType === "Complaint") {
    return (
      notification.complaint?.complainedRecipients?.flatMap((recipient) => {
        const recipientEmail = recipient.emailAddress ? normalizeEmailAddress(recipient.emailAddress) : "";
        if (!recipientEmail) {
          return [];
        }

        return [
          {
            eventKey: buildEventKey({
              eventType: "COMPLAINT",
              recipientEmail,
              sesMessageId: messageId,
              sesEventId: undefined,
              timestamp: notification.mail?.timestamp,
            }),
            recipientEmail,
            eventType: "COMPLAINT",
            sesMessageId: messageId,
            topicArn,
            detail: notification.complaint?.complaintFeedbackType ?? "Complaint received by SES.",
            rawPayload,
            mailTimestamp,
            eventTimestamp: mailTimestamp,
          },
        ];
      }) ?? []
    );
  }

  if (eventType === "Delivery") {
    return (
      notification.delivery?.recipients?.flatMap((emailAddress) => {
        const recipientEmail = normalizeEmailAddress(emailAddress);

        return [
          {
            eventKey: buildEventKey({
              eventType: "DELIVERY",
              recipientEmail,
              sesMessageId: messageId,
              timestamp: notification.delivery?.timestamp ?? notification.mail?.timestamp,
            }),
            recipientEmail,
            eventType: "DELIVERY",
            sesMessageId: messageId,
            topicArn,
            detail: notification.delivery?.smtpResponse ?? "Delivered by SES.",
            rawPayload,
            mailTimestamp,
            eventTimestamp: parseTimestamp(notification.delivery?.timestamp) ?? mailTimestamp,
          },
        ];
      }) ?? []
    );
  }

  const fallbackRecipients = uniqueEmails(notification.mail?.destination ?? []);

  return fallbackRecipients.map((recipientEmail) => ({
    eventKey: buildEventKey({
      eventType: "UNKNOWN",
      recipientEmail,
      sesMessageId: messageId,
      timestamp: notification.mail?.timestamp,
    }),
    recipientEmail,
    eventType: "UNKNOWN",
    sesMessageId: messageId,
    topicArn,
    detail: `Unhandled SES notification type: ${eventType ?? "unknown"}`,
    rawPayload,
    mailTimestamp,
    eventTimestamp: mailTimestamp,
  }));
}

export function buildEmailLogEntriesForSendResult(input: {
  submissionId: string;
  intendedRecipients: string[];
  subject: string;
  sendResult: SendEmailResult;
}) {
  const intendedRecipients = uniqueEmails(input.intendedRecipients);

  if (!intendedRecipients.length) {
    return [] as Prisma.EmailLogCreateManyInput[];
  }

  const sentAt = input.sendResult.skipped ? undefined : new Date();
  const suppressedSet = new Set(input.sendResult.suppressedRecipients.map(normalizeEmailAddress));
  const acceptedSet = new Set(input.sendResult.acceptedRecipients.map(normalizeEmailAddress));

  return intendedRecipients.map((recipientEmail) => {
    if (acceptedSet.has(recipientEmail) && !input.sendResult.skipped) {
      return {
        submissionId: input.submissionId,
        recipientEmail,
        emailSubject: input.subject,
        emailStatus: "SENT" as const,
        sesMessageId: input.sendResult.messageId,
        sentAt,
      };
    }

    const errorMessage = suppressedSet.has(recipientEmail)
      ? input.sendResult.suppressionReason ?? input.sendResult.skippedReason
      : input.sendResult.skippedReason;

    return {
      submissionId: input.submissionId,
      recipientEmail,
      emailSubject: input.subject,
      emailStatus: "SKIPPED" as const,
      errorMessage: errorMessage ?? "Email delivery was skipped.",
    };
  });
}

export function buildSuppressedEmailLogEntries(input: {
  submissionId: string;
  recipients: string[];
  subject: string;
  reason: string;
}) {
  return uniqueEmails(input.recipients).map((recipientEmail) => ({
    submissionId: input.submissionId,
    recipientEmail,
    emailSubject: input.subject,
    emailStatus: "SKIPPED" as const,
    errorMessage: input.reason,
  }));
}

export async function processSesNotificationEnvelope(envelope: SnsEnvelope) {
  assertTopicAllowed(envelope.TopicArn);
  const notification = JSON.parse(envelope.Message) as SesNotificationPayload;
  const events = extractSesEvents(notification, envelope.TopicArn);

  if (!events.length) {
    return {
      processedCount: 0,
      suppressedCount: 0,
    };
  }

  const candidateMessageIds = uniqueStrings(
    events.map((event) => event.sesMessageId ?? "").filter(Boolean),
  );
  const candidateRecipients = uniqueEmails(events.map((event) => event.recipientEmail));

  const emailLogs = candidateMessageIds.length
    ? await prisma.emailLog.findMany({
        where: {
          sesMessageId: {
            in: candidateMessageIds,
          },
          recipientEmail: {
            in: candidateRecipients,
          },
        },
        include: {
          submission: {
            select: {
              workspaceId: true,
            },
          },
        },
      })
    : [];

  const logByKey = new Map(
    emailLogs.map((log) => [`${log.sesMessageId ?? ""}:${normalizeEmailAddress(log.recipientEmail)}`, log]),
  );

  const suppressionEvents = events.filter(
    (event) => event.eventType === "BOUNCE" || event.eventType === "COMPLAINT",
  );

  await prisma.$transaction(async (tx) => {
    await tx.emailDeliveryEvent.createMany({
      data: events.map((event) => ({
        eventKey: event.eventKey,
        workspaceId:
          logByKey.get(`${event.sesMessageId ?? ""}:${normalizeEmailAddress(event.recipientEmail)}`)?.submission
            .workspaceId ?? null,
        emailLogId:
          logByKey.get(`${event.sesMessageId ?? ""}:${normalizeEmailAddress(event.recipientEmail)}`)?.id ??
          null,
        recipientEmail: event.recipientEmail,
        eventType: event.eventType,
        sesMessageId: event.sesMessageId,
        sesEventId: event.sesEventId,
        topicArn: event.topicArn,
        detail: event.detail,
        rawPayload: event.rawPayload,
        mailTimestamp: event.mailTimestamp,
        eventTimestamp: event.eventTimestamp,
      })),
      skipDuplicates: true,
    });

    for (const event of suppressionEvents) {
      await tx.emailSuppression.upsert({
        where: {
          recipientEmail: event.recipientEmail,
        },
        update: {
          workspaceId:
            logByKey.get(`${event.sesMessageId ?? ""}:${normalizeEmailAddress(event.recipientEmail)}`)?.submission
              .workspaceId ?? null,
          reason: event.eventType === "BOUNCE" ? "BOUNCE" : "COMPLAINT",
          source: "AWS_SES_WEBHOOK",
          detail: event.detail,
          sesMessageId: event.sesMessageId,
          topicArn: event.topicArn,
          rawPayload: event.rawPayload,
          lastEventAt: event.eventTimestamp ?? new Date(),
        },
        create: {
          workspaceId:
            logByKey.get(`${event.sesMessageId ?? ""}:${normalizeEmailAddress(event.recipientEmail)}`)?.submission
              .workspaceId ?? null,
          recipientEmail: event.recipientEmail,
          reason: event.eventType === "BOUNCE" ? "BOUNCE" : "COMPLAINT",
          source: "AWS_SES_WEBHOOK",
          detail: event.detail,
          sesMessageId: event.sesMessageId,
          topicArn: event.topicArn,
          rawPayload: event.rawPayload,
          lastEventAt: event.eventTimestamp ?? new Date(),
        },
      });

      await tx.emailLog.updateMany({
        where: {
          sesMessageId: event.sesMessageId,
          recipientEmail: event.recipientEmail,
        },
        data: {
          errorMessage: event.detail ?? `${event.eventType} reported by AWS SES.`,
        },
      });
    }
  });

  return {
    processedCount: events.length,
    suppressedCount: suppressionEvents.length,
  };
}
