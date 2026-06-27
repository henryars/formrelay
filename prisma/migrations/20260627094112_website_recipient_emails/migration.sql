-- Convert Website.defaultRecipientEmail (single) into defaultRecipientEmails (array)
ALTER TABLE "Website" ADD COLUMN "defaultRecipientEmails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "Website"
SET "defaultRecipientEmails" = ARRAY["defaultRecipientEmail"]
WHERE "defaultRecipientEmail" IS NOT NULL AND "defaultRecipientEmail" <> '';

ALTER TABLE "Website" DROP COLUMN "defaultRecipientEmail";
