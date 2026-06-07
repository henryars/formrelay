import { describe, expect, it } from "vitest";

import { createSubmissionCsv } from "@/lib/csv";
import { assessSubmissionSpam, decideNotification } from "@/lib/spam";

describe("csv export and spam scoring", () => {
  it("creates csv rows with escaped content", () => {
    const csv = createSubmissionCsv([
      {
        status: "NEW",
        spamStatus: "CLEAN",
        submitterName: 'Jane "JJ" Doe',
        submitterEmail: "jane@example.com",
        submitterPhone: null,
        messagePreview: "Hello,\nteam",
        sourceUrl: "https://clientsite.com/contact",
        createdAt: new Date("2026-06-07T12:00:00.000Z"),
        website: { websiteName: "Client Site" },
        form: { formName: "Contact Form" },
        fieldItems: [{ key: "name", label: "Name", value: 'Jane "JJ" Doe' }],
      },
    ]);

    expect(csv).toContain('"Jane ""JJ"" Doe"');
    expect(csv).toContain('"Hello,');
  });

  it("keeps a valid lead clean even when origin mismatches in standard mode", () => {
    const result = assessSubmissionSpam({
      fields: {
        name: "Preview Lead",
        email: "lead@example.com",
        phone: "+2348012345678",
        message: "I need help with a redesign for our company website.",
      },
      fieldItems: [],
      userAgent: "Mozilla/5.0",
      sourceTrust: {
        allowedDomains: ["clientsite.com"],
        checkedDomains: ["preview.lovable.app"],
        matchedDomain: null,
        sourceUrl: "https://preview.lovable.app/contact",
        originHeader: "https://preview.lovable.app",
        refererHeader: null,
      },
      formType: "CONTACT",
      spamProtectionLevel: "STANDARD",
      websiteProtectionMode: "STANDARD",
      submitterName: "Preview Lead",
      submitterEmail: "lead@example.com",
      submitterPhone: "+2348012345678",
      messagePreview: "I need help with a redesign for our company website.",
      rateReasons: [],
      fieldCount: 4,
      payloadSize: 1024,
      configuredHoneypotFieldName: "_hp_formrelay",
    });

    expect(result.spamStatus).toBe("CLEAN");
    expect(result.spamScore).toBeLessThan(40);
  });

  it("forces honeypot-filled submissions to be at least suspicious", () => {
    const result = assessSubmissionSpam({
      fields: {
        name: "Possible Lead",
        email: "person@example.com",
        message: "Need help with our site.",
        _company_website: "filled",
      },
      fieldItems: [],
      userAgent: "Mozilla/5.0",
      sourceTrust: {
        allowedDomains: ["clientsite.com"],
        checkedDomains: ["clientsite.com"],
        matchedDomain: "clientsite.com",
        sourceUrl: "https://clientsite.com/contact",
        originHeader: "https://clientsite.com",
        refererHeader: "https://clientsite.com/contact",
      },
      formType: "CONTACT",
      spamProtectionLevel: "STANDARD",
      websiteProtectionMode: "STANDARD",
      submitterName: "Possible Lead",
      submitterEmail: "person@example.com",
      submitterPhone: undefined,
      messagePreview: "Need help with our site.",
      configuredHoneypotFieldName: "_company_website",
    });

    expect(["SUSPICIOUS", "SPAM"]).toContain(result.spamStatus);
    expect(result.reasons.some((reason) => reason.code === "HONEYPOT_FILLED")).toBe(true);
  });

  it("flags obviously suspicious spam-like submissions", () => {
    const result = assessSubmissionSpam({
      fields: {
        email: "promo@mailinator.com",
        message:
          "crypto backlinks https://one.example https://two.example https://three.example",
        _company_website: "bot",
      },
      fieldItems: [],
      userAgent: "curl/8.0",
      sourceTrust: {
        allowedDomains: ["clientsite.com"],
        checkedDomains: ["evil.example"],
        matchedDomain: null,
        sourceUrl: "https://evil.example/contact",
        originHeader: "https://evil.example",
        refererHeader: "https://evil.example/contact",
      },
      formType: "CONTACT",
      spamProtectionLevel: "STRICT",
      websiteProtectionMode: "STRICT",
      submitterEmail: "promo@mailinator.com",
      messagePreview:
        "crypto backlinks https://one.example https://two.example https://three.example",
      configuredHoneypotFieldName: "_company_website",
    });

    expect(result.spamStatus).toBe("SPAM");
    expect(result.spamScore).toBeGreaterThanOrEqual(70);
  });

  it("notifies low suspicious submissions by default and suppresses spam by default", () => {
    expect(
      decideNotification({
        spamStatus: "SUSPICIOUS",
        spamScore: 55,
        spamBucket: "INBOX",
        notifyOnLowSuspicious: true,
        notifyOnSuspicious: false,
        notifyOnSpam: false,
      }).shouldNotify,
    ).toBe(true);

    expect(
      decideNotification({
        spamStatus: "SPAM",
        spamScore: 90,
        spamBucket: "SPAM",
        notifyOnLowSuspicious: true,
        notifyOnSuspicious: false,
        notifyOnSpam: false,
      }).notificationStatus,
    ).toBe("SUPPRESSED_SPAM");
  });
});
