import { describe, expect, it } from "vitest";

import {
  countTruthyFields,
  deriveFieldCandidates,
  deriveSubmissionSummary,
  getSubmissionShapeMetrics,
  parseSubmissionRequest,
} from "@/lib/form-submission";

describe("form submission helpers", () => {
  it("parses JSON submissions and derives field candidates", async () => {
    const request = new Request("http://localhost/test", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          full_name: "Jane Doe",
          email_address: "jane@example.com",
          phone_number: "+2348000000000",
          message: "Hello there",
        },
        source_url: "https://clientsite.com/contact",
        page_title: "Contact Us",
      }),
    });

    const parsed = await parseSubmissionRequest(request);

    expect(parsed.sourceUrl).toBe("https://clientsite.com/contact");
    expect(countTruthyFields(parsed.fields)).toBe(4);
    expect(deriveFieldCandidates(parsed.fieldItems)).toEqual({
      nameFieldKey: "full_name",
      emailFieldKey: "email_address",
      phoneFieldKey: "phone_number",
      messageFieldKey: "message",
    });
  });

  it("prefers mapped field keys when deriving summary", () => {
    const summary = deriveSubmissionSummary(
      {
        sender_name: "Mapped Name",
        sender_email: "mapped@example.com",
        sender_phone: "123",
        inquiry: "Need help",
      },
      {
        nameFieldKey: "sender_name",
        emailFieldKey: "sender_email",
        phoneFieldKey: "sender_phone",
        messageFieldKey: "inquiry",
      },
    );

    expect(summary).toEqual({
      submitterName: "Mapped Name",
      submitterEmail: "mapped@example.com",
      submitterPhone: "123",
      messagePreview: "Need help",
    });
  });

  it("captures shape metrics for request safety checks", () => {
    const metrics = getSubmissionShapeMetrics({
      short_key: "hello",
      nested: {
        deeper: {
          value: "world",
        },
      },
    });

    expect(metrics.maxFieldKeyLength).toBeGreaterThanOrEqual("short_key".length);
    expect(metrics.maxJsonDepth).toBeGreaterThan(1);
    expect(metrics.totalTextLength).toBeGreaterThan(0);
    expect(metrics.hasOverlongValue).toBe(false);
  });
});
