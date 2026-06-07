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
