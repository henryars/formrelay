import { describe, expect, it } from "vitest";

import {
  buildAllowedDomains,
  createSubmissionFingerprint,
  evaluateRateLimits,
  inferRateSignals,
  isAllowedSubmissionSource,
  isFieldCountAllowed,
  isPayloadSizeAllowed,
} from "@/lib/submission-security";

describe("submission security", () => {
  it("builds allowed domains from configured domains and website url", () => {
    expect(
      buildAllowedDomains({
        websiteUrl: "https://www.clientsite.com",
        allowedDomains: ["forms.clientsite.com"],
      }),
    ).toEqual(["forms.clientsite.com", "clientsite.com"]);
  });

  it("allows matching source domains and blocks mismatches", () => {
    expect(
      isAllowedSubmissionSource({
        websiteUrl: "https://clientsite.com",
        allowedDomains: ["forms.clientsite.com"],
        sourceUrl: "https://www.clientsite.com/contact",
      }).allowed,
    ).toBe(true);

    expect(
      isAllowedSubmissionSource({
        websiteUrl: "https://clientsite.com",
        allowedDomains: ["forms.clientsite.com"],
        sourceUrl: "https://evil.example/contact",
      }).allowed,
    ).toBe(false);
  });

  it("returns stable fingerprints for identical field payloads", () => {
    const first = createSubmissionFingerprint({ b: 2, a: 1 });
    const second = createSubmissionFingerprint({ a: 1, b: 2 });

    expect(first).toBe(second);
  });

  it("enforces duplicate and rate limit checks", () => {
    expect(
      evaluateRateLimits({
        now: new Date(),
        ipCountLastMinute: 0,
        ipCountLastHour: 0,
        formCountLastTenMinutes: 0,
        duplicateCountLastTwoMinutes: 1,
        duplicateCountLastTenMinutes: 1,
      }).allowed,
    ).toBe(true);

    expect(
      evaluateRateLimits({
        now: new Date(),
        ipCountLastMinute: 5,
        ipCountLastHour: 0,
        formCountLastTenMinutes: 0,
        duplicateCountLastTwoMinutes: 0,
        duplicateCountLastTenMinutes: 0,
      }).statusCode,
    ).toBe(429);
  });

  it("infers duplicate and burst signals without hard-blocking by itself", () => {
    const reasons = inferRateSignals({
      ipCountLastMinute: 4,
      duplicateCountLastTwoMinutes: 1,
      duplicateCountLastTenMinutes: 1,
      sameIpManyFormsLastTenMinutes: 6,
    });

    expect(reasons.map((reason) => reason.code)).toEqual(
      expect.arrayContaining([
        "EXACT_DUPLICATE_2_MINUTES",
        "IP_RATE_ELEVATED",
        "IP_HITTING_MANY_FORMS",
      ]),
    );
  });

  it("guards payload size and field count", () => {
    expect(isPayloadSizeAllowed(String(1024))).toBe(true);
    expect(isPayloadSizeAllowed(String(300 * 1024))).toBe(false);
    expect(isFieldCountAllowed(20)).toBe(true);
    expect(isFieldCountAllowed(80)).toBe(false);
  });
});
