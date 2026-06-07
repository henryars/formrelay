import { describe, expect, it } from "vitest";

import {
  buildEmailLogEntriesForSendResult,
  buildSuppressedEmailLogEntries,
} from "@/lib/email-delivery";

describe("email delivery helpers", () => {
  it("builds sent and suppressed recipient logs per recipient", () => {
    const logs = buildEmailLogEntriesForSendResult({
      submissionId: "sub_123",
      intendedRecipients: ["hello@example.com", "ops@example.com"],
      subject: "New submission",
      sendResult: {
        skipped: false,
        messageId: "ses_123",
        acceptedRecipients: ["hello@example.com"],
        suppressedRecipients: ["ops@example.com"],
        suppressionReason: "Some recipients were skipped because SES previously bounced them.",
      },
    });

    expect(logs).toHaveLength(2);
    expect(logs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recipientEmail: "hello@example.com",
          emailStatus: "SENT",
          sesMessageId: "ses_123",
        }),
        expect.objectContaining({
          recipientEmail: "ops@example.com",
          emailStatus: "SKIPPED",
          errorMessage: "Some recipients were skipped because SES previously bounced them.",
        }),
      ]),
    );
  });

  it("builds skipped logs when notifications are suppressed by policy", () => {
    const logs = buildSuppressedEmailLogEntries({
      submissionId: "sub_456",
      recipients: ["hello@example.com", "ops@example.com"],
      subject: "Submission notification",
      reason: "Spam notifications are suppressed by default.",
    });

    expect(logs).toHaveLength(2);
    expect(logs.every((log) => log.emailStatus === "SKIPPED")).toBe(true);
    expect(logs.every((log) => log.errorMessage === "Spam notifications are suppressed by default.")).toBe(
      true,
    );
  });
});
