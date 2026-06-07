ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "passwordResetToken" TEXT,
  ADD COLUMN IF NOT EXISTS "passwordResetExpires" TIMESTAMP(3);

ALTER TABLE "FormInbox"
  ADD COLUMN IF NOT EXISTS "nameFieldKey" TEXT,
  ADD COLUMN IF NOT EXISTS "emailFieldKey" TEXT,
  ADD COLUMN IF NOT EXISTS "phoneFieldKey" TEXT,
  ADD COLUMN IF NOT EXISTS "messageFieldKey" TEXT;

ALTER TABLE "Submission"
  ADD COLUMN IF NOT EXISTS "submissionFingerprint" TEXT;

CREATE INDEX IF NOT EXISTS "Submission_formId_submissionFingerprint_createdAt_idx"
  ON "Submission"("formId", "submissionFingerprint", "createdAt");

DO $$
BEGIN
  CREATE TYPE "EmailSuppressionReason" AS ENUM ('BOUNCE', 'COMPLAINT', 'MANUAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "EmailDeliveryEventType" AS ENUM ('DELIVERY', 'BOUNCE', 'COMPLAINT', 'SUBSCRIPTION_CONFIRMATION', 'UNKNOWN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "EmailSuppression" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "EmailSuppression_recipientEmail_key"
  ON "EmailSuppression"("recipientEmail");

CREATE INDEX IF NOT EXISTS "EmailSuppression_reason_updatedAt_idx"
  ON "EmailSuppression"("reason", "updatedAt");

CREATE INDEX IF NOT EXISTS "EmailSuppression_workspaceId_updatedAt_idx"
  ON "EmailSuppression"("workspaceId", "updatedAt");

CREATE TABLE IF NOT EXISTS "EmailDeliveryEvent" (
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

CREATE UNIQUE INDEX IF NOT EXISTS "EmailDeliveryEvent_eventKey_key"
  ON "EmailDeliveryEvent"("eventKey");

CREATE INDEX IF NOT EXISTS "EmailDeliveryEvent_emailLogId_idx"
  ON "EmailDeliveryEvent"("emailLogId");

CREATE INDEX IF NOT EXISTS "EmailDeliveryEvent_recipientEmail_createdAt_idx"
  ON "EmailDeliveryEvent"("recipientEmail", "createdAt");

CREATE INDEX IF NOT EXISTS "EmailDeliveryEvent_sesMessageId_idx"
  ON "EmailDeliveryEvent"("sesMessageId");

CREATE INDEX IF NOT EXISTS "EmailDeliveryEvent_eventType_createdAt_idx"
  ON "EmailDeliveryEvent"("eventType", "createdAt");

CREATE INDEX IF NOT EXISTS "EmailDeliveryEvent_workspaceId_createdAt_idx"
  ON "EmailDeliveryEvent"("workspaceId", "createdAt");

CREATE INDEX IF NOT EXISTS "EmailLog_recipientEmail_createdAt_idx"
  ON "EmailLog"("recipientEmail", "createdAt");

CREATE INDEX IF NOT EXISTS "EmailLog_sesMessageId_idx"
  ON "EmailLog"("sesMessageId");

DO $$
BEGIN
  ALTER TABLE "EmailDeliveryEvent"
    ADD CONSTRAINT "EmailDeliveryEvent_emailLogId_fkey"
    FOREIGN KEY ("emailLogId") REFERENCES "EmailLog"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
