-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserPlan" AS ENUM ('FREE', 'PRO', 'AGENCY');

-- CreateEnum
CREATE TYPE "BillingStatus" AS ENUM ('TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "WebsiteStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FormStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SubmissionStatus" AS ENUM ('NEW', 'CONTACTED', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SpamStatus" AS ENUM ('CLEAN', 'SUSPICIOUS', 'SPAM', 'BLOCKED');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "EmailSuppressionReason" AS ENUM ('BOUNCE', 'COMPLAINT', 'MANUAL');

-- CreateEnum
CREATE TYPE "EmailDeliveryEventType" AS ENUM ('DELIVERY', 'BOUNCE', 'COMPLAINT', 'SUBSCRIPTION_CONFIRMATION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SpamBucket" AS ENUM ('INBOX', 'SUSPICIOUS', 'SPAM', 'BLOCKED_LOG');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('SENT', 'QUEUED', 'SUPPRESSED_SPAM', 'SUPPRESSED_SUSPICIOUS', 'FAILED', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "WebsiteProtectionMode" AS ENUM ('OPEN', 'STANDARD', 'STRICT');

-- CreateEnum
CREATE TYPE "FormType" AS ENUM ('CONTACT', 'QUOTE_REQUEST', 'NEWSLETTER', 'BOOKING_ENQUIRY', 'WAITLIST', 'OTHER');

-- CreateEnum
CREATE TYPE "SpamFeedbackAction" AS ENUM ('MARKED_SPAM', 'MARKED_NOT_SPAM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "passwordResetToken" TEXT,
    "passwordResetExpires" TIMESTAMP(3),
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "ownerUserId" TEXT NOT NULL,
    "workspaceName" TEXT NOT NULL,
    "plan" "UserPlan" NOT NULL DEFAULT 'FREE',
    "billingStatus" "BillingStatus" NOT NULL DEFAULT 'TRIALING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Website" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "websiteName" TEXT NOT NULL,
    "websiteUrl" TEXT NOT NULL,
    "defaultRecipientEmail" TEXT NOT NULL,
    "allowedDomains" TEXT[],
    "defaultSuccessRedirect" TEXT,
    "timezone" TEXT,
    "status" "WebsiteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Website_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormInbox" (
    "id" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "formName" TEXT NOT NULL,
    "publicFormId" TEXT NOT NULL,
    "endpointUrl" TEXT,
    "recipientEmails" TEXT[],
    "successRedirectUrl" TEXT,
    "spamProtectionLevel" TEXT NOT NULL DEFAULT 'STANDARD',
    "websiteProtectionMode" "WebsiteProtectionMode" NOT NULL DEFAULT 'STANDARD',
    "formType" "FormType" NOT NULL DEFAULT 'CONTACT',
    "honeypotFieldName" TEXT,
    "nameFieldKey" TEXT,
    "emailFieldKey" TEXT,
    "phoneFieldKey" TEXT,
    "messageFieldKey" TEXT,
    "status" "FormStatus" NOT NULL DEFAULT 'ACTIVE',
    "notifyOnLowSuspicious" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnSuspicious" BOOLEAN NOT NULL DEFAULT false,
    "notifyOnSpam" BOOLEAN NOT NULL DEFAULT false,
    "weeklySpamSummary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FormInbox_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "websiteId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'NEW',
    "spamStatus" "SpamStatus" NOT NULL DEFAULT 'CLEAN',
    "spamScore" INTEGER NOT NULL DEFAULT 0,
    "spamBucket" "SpamBucket" NOT NULL DEFAULT 'INBOX',
    "spamReasons" JSONB,
    "spamCheckedAt" TIMESTAMP(3),
    "notificationStatus" "NotificationStatus" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "notificationSuppressedReason" TEXT,
    "submitterName" TEXT,
    "submitterEmail" TEXT,
    "submitterPhone" TEXT,
    "messagePreview" TEXT,
    "rawFields" JSONB NOT NULL,
    "fieldItems" JSONB NOT NULL,
    "sourceUrl" TEXT,
    "pageTitle" TEXT,
    "originHeader" TEXT,
    "refererHeader" TEXT,
    "referrer" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "requestFingerprint" TEXT,
    "submissionFingerprint" TEXT,
    "payloadHash" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailLog" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "emailSubject" TEXT NOT NULL,
    "emailStatus" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "sesMessageId" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpamEvent" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "scoreAdded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpamEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedEvent" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "websiteId" TEXT,
    "formId" TEXT,
    "publicFormId" TEXT,
    "reason" TEXT NOT NULL,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "originHeader" TEXT,
    "refererHeader" TEXT,
    "payloadSize" INTEGER,
    "fieldCount" INTEGER,
    "contentType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlockedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpamFeedback" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "action" "SpamFeedbackAction" NOT NULL,
    "previousSpamScore" INTEGER NOT NULL,
    "previousClassification" "SpamStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpamFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailSuppression" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "reason" "EmailSuppressionReason" NOT NULL,
    "source" TEXT NOT NULL,
    "detail" TEXT,
    "sesMessageId" TEXT,
    "topicArn" TEXT,
    "rawPayload" JSONB,
    "lastEventAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailSuppression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailDeliveryEvent" (
    "id" TEXT NOT NULL,
    "eventKey" TEXT NOT NULL,
    "workspaceId" TEXT,
    "emailLogId" TEXT,
    "recipientEmail" TEXT NOT NULL,
    "eventType" "EmailDeliveryEventType" NOT NULL,
    "sesMessageId" TEXT,
    "sesEventId" TEXT,
    "topicArn" TEXT,
    "detail" TEXT,
    "rawPayload" JSONB NOT NULL,
    "mailTimestamp" TIMESTAMP(3),
    "eventTimestamp" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailDeliveryEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Website_workspaceId_idx" ON "Website"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "FormInbox_publicFormId_key" ON "FormInbox"("publicFormId");

-- CreateIndex
CREATE INDEX "FormInbox_websiteId_idx" ON "FormInbox"("websiteId");

-- CreateIndex
CREATE INDEX "Submission_workspaceId_createdAt_idx" ON "Submission"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_websiteId_createdAt_idx" ON "Submission"("websiteId", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_formId_createdAt_idx" ON "Submission"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_spamStatus_createdAt_idx" ON "Submission"("spamStatus", "createdAt");

-- CreateIndex
CREATE INDEX "Submission_formId_submissionFingerprint_createdAt_idx" ON "Submission"("formId", "submissionFingerprint", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_submissionId_idx" ON "EmailLog"("submissionId");

-- CreateIndex
CREATE INDEX "EmailLog_recipientEmail_createdAt_idx" ON "EmailLog"("recipientEmail", "createdAt");

-- CreateIndex
CREATE INDEX "EmailLog_sesMessageId_idx" ON "EmailLog"("sesMessageId");

-- CreateIndex
CREATE INDEX "SpamEvent_submissionId_idx" ON "SpamEvent"("submissionId");

-- CreateIndex
CREATE INDEX "BlockedEvent_workspaceId_createdAt_idx" ON "BlockedEvent"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "BlockedEvent_formId_createdAt_idx" ON "BlockedEvent"("formId", "createdAt");

-- CreateIndex
CREATE INDEX "SpamFeedback_submissionId_idx" ON "SpamFeedback"("submissionId");

-- CreateIndex
CREATE INDEX "SpamFeedback_formId_createdAt_idx" ON "SpamFeedback"("formId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailSuppression_recipientEmail_key" ON "EmailSuppression"("recipientEmail");

-- CreateIndex
CREATE INDEX "EmailSuppression_reason_updatedAt_idx" ON "EmailSuppression"("reason", "updatedAt");

-- CreateIndex
CREATE INDEX "EmailSuppression_workspaceId_updatedAt_idx" ON "EmailSuppression"("workspaceId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "EmailDeliveryEvent_eventKey_key" ON "EmailDeliveryEvent"("eventKey");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_emailLogId_idx" ON "EmailDeliveryEvent"("emailLogId");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_recipientEmail_createdAt_idx" ON "EmailDeliveryEvent"("recipientEmail", "createdAt");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_sesMessageId_idx" ON "EmailDeliveryEvent"("sesMessageId");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_eventType_createdAt_idx" ON "EmailDeliveryEvent"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "EmailDeliveryEvent_workspaceId_createdAt_idx" ON "EmailDeliveryEvent"("workspaceId", "createdAt");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Website" ADD CONSTRAINT "Website_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormInbox" ADD CONSTRAINT "FormInbox_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormInbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailLog" ADD CONSTRAINT "EmailLog_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpamEvent" ADD CONSTRAINT "SpamEvent_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedEvent" ADD CONSTRAINT "BlockedEvent_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES "Website"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedEvent" ADD CONSTRAINT "BlockedEvent_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormInbox"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpamFeedback" ADD CONSTRAINT "SpamFeedback_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpamFeedback" ADD CONSTRAINT "SpamFeedback_formId_fkey" FOREIGN KEY ("formId") REFERENCES "FormInbox"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailDeliveryEvent" ADD CONSTRAINT "EmailDeliveryEvent_emailLogId_fkey" FOREIGN KEY ("emailLogId") REFERENCES "EmailLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
