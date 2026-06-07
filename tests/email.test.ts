import { describe, expect, it } from "vitest";

import { renderSubmissionEmail, sendSubmissionEmail } from "@/lib/email";

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

  it("skips sending when there are no recipients", async () => {
    const result = await sendSubmissionEmail({
      to: [],
      subject: "Hello",
      html: "<p>Hi</p>",
    });

    expect(result).toEqual({ skipped: true });
  });
});
