import { createHash } from "node:crypto";

const TEN_MINUTES_MS = 10 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;

function safeUrlHost(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export function normalizeDomain(value: string) {
  return value.trim().toLowerCase().replace(/^www\./, "");
}

export function buildAllowedDomains(input: {
  websiteUrl: string;
  allowedDomains: string[];
}) {
  const derived = safeUrlHost(input.websiteUrl);
  const values = [
    ...input.allowedDomains.map(normalizeDomain),
    ...(derived ? [normalizeDomain(derived)] : []),
  ];

  return [...new Set(values.filter(Boolean))];
}

export function getSubmissionCandidateDomains(input: {
  sourceUrl?: string | null;
  referrer?: string | null;
  originHeader?: string | null;
}) {
  const hosts = [
    safeUrlHost(input.sourceUrl),
    safeUrlHost(input.referrer),
    safeUrlHost(input.originHeader),
  ].filter(Boolean) as string[];

  return [...new Set(hosts.map(normalizeDomain))];
}

export function isAllowedSubmissionSource(input: {
  websiteUrl: string;
  allowedDomains: string[];
  sourceUrl?: string | null;
  referrer?: string | null;
  originHeader?: string | null;
}) {
  const allowedDomains = buildAllowedDomains({
    websiteUrl: input.websiteUrl,
    allowedDomains: input.allowedDomains,
  });
  const candidateDomains = getSubmissionCandidateDomains(input);

  if (!candidateDomains.length) {
    return {
      allowed: true,
      matchedDomain: null,
      checkedDomains: candidateDomains,
      allowedDomains,
    };
  }

  const matchedDomain = candidateDomains.find((domain) =>
    allowedDomains.some((allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)),
  );

  return {
    allowed: Boolean(matchedDomain),
    matchedDomain: matchedDomain ?? null,
    checkedDomains: candidateDomains,
    allowedDomains,
  };
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nestedValue]) => `${key}:${stableSerialize(nestedValue)}`);
    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value ?? null);
}

export function createSubmissionFingerprint(fields: Record<string, unknown>) {
  return createHash("sha256").update(stableSerialize(fields)).digest("hex");
}

export function evaluateRateLimits(input: {
  now: Date;
  ipCountLastMinute: number;
  ipCountLastHour: number;
  formCountLastTenMinutes: number;
  duplicateCountLastTwoMinutes: number;
  duplicateCountLastTenMinutes: number;
  sameIpManyFormsLastTenMinutes?: number;
}) {
  if (input.ipCountLastMinute >= 5 || input.ipCountLastHour >= 20) {
    return {
      allowed: false,
      statusCode: 429,
      message: "Too many submissions. Please try again later.",
      retryAfterSeconds: 60,
    };
  }

  if (input.formCountLastTenMinutes >= 100) {
    return {
      allowed: false,
      statusCode: 429,
      message: "Too many submissions. Please try again later.",
      retryAfterSeconds: Math.ceil(TEN_MINUTES_MS / 1000),
    };
  }

  if ((input.sameIpManyFormsLastTenMinutes ?? 0) >= 20) {
    return {
      allowed: false,
      statusCode: 429,
      message: "Submission could not be processed.",
      retryAfterSeconds: Math.ceil(ONE_HOUR_MS / 1000),
    };
  }

  return {
    allowed: true,
    statusCode: 200,
    message: "Allowed",
    retryAfterSeconds: 0,
  };
}

export function isPayloadSizeAllowed(contentLengthHeader: string | null, limitBytes = 250 * 1024) {
  if (!contentLengthHeader) {
    return true;
  }

  const size = Number(contentLengthHeader);
  return Number.isFinite(size) ? size <= limitBytes : true;
}

export function isFieldCountAllowed(fieldCount: number, maxFieldCount = 50) {
  return fieldCount <= maxFieldCount;
}

export function isTextValueLengthAllowed(value: string, maxLength = 10_000) {
  return value.length <= maxLength;
}

export function isTotalTextLengthAllowed(totalLength: number, maxTotalLength = 50_000) {
  return totalLength <= maxTotalLength;
}

export function inferRateSignals(input: {
  ipCountLastMinute: number;
  duplicateCountLastTwoMinutes: number;
  duplicateCountLastTenMinutes: number;
  sameIpManyFormsLastTenMinutes?: number;
}) {
  const reasons: Array<{ code: string; label: string; score: number; severity: "low" | "medium" | "high" }> = [];

  if (input.duplicateCountLastTwoMinutes > 0) {
    reasons.push({
      code: "EXACT_DUPLICATE_2_MINUTES",
      label: "Exact duplicate submitted within 2 minutes",
      score: 40,
      severity: "high",
    });
  } else if (input.duplicateCountLastTenMinutes > 0) {
    reasons.push({
      code: "EXACT_DUPLICATE_10_MINUTES",
      label: "Exact duplicate submitted within 10 minutes",
      score: 25,
      severity: "medium",
    });
  }

  if (input.ipCountLastMinute >= 3 && input.ipCountLastMinute < 5) {
    reasons.push({
      code: "IP_RATE_ELEVATED",
      label: "Multiple submissions from the same source in a short time",
      score: 15,
      severity: "medium",
    });
  }

  if ((input.sameIpManyFormsLastTenMinutes ?? 0) >= 5) {
    reasons.push({
      code: "IP_HITTING_MANY_FORMS",
      label: "Same source has submitted to many forms recently",
      score: (input.sameIpManyFormsLastTenMinutes ?? 0) >= 20 ? 50 : 20,
      severity: (input.sameIpManyFormsLastTenMinutes ?? 0) >= 20 ? "high" : "medium",
    });
  }

  return reasons;
}
