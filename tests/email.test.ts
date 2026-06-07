import { describe, expect, it } from "vitest";

import { renderPasswordResetEmail, renderSubmissionEmail, sendSubmissionEmail } from "@/lib/email";

describe("email helpers", () => {
  it("renders a readable submission email", () => {
    const html = renderSubmissionEmail({
      websiteName: "Client Site",
      formName: "Contact Form",
      sourceUrl: "https://clientsite.com/contact",
      fieldItems: [
        { label: "Name", value: "Jane Doe" },
        { label: "Email", value: "jane@example.com" },
      ],
    });

    expect(html).toContain("New submission from Contact Form");
    expect(html).toContain("Client Site");
    expect(html).toContain("jane@example.com");
  });

  it("renders a password reset email with the reset URL", () => {
    const html = renderPasswordResetEmail({
      fullName: "Jane Doe",
      resetUrl: "https://formrelay.com/reset-password?token=abc123",
    });

    expect(html).toContain("Reset your password");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("https://formrelay.com/reset-password?token=abc123");
  });

  it("skips sending when there are no recipients", async () => {
    const result = await sendSubmissionEmail({
      to: [],
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result).toEqual({
      skipped: true,
      acceptedRecipients: [],
      suppressedRecipients: [],
      skippedReason: "No recipient emails were configured.",
    });
  });
});
