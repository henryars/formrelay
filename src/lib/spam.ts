import type { FormType, NotificationStatus, SpamBucket, SpamStatus, WebsiteProtectionMode } from "@prisma/client";

import type { NormalizedFieldItem } from "@/lib/form-submission";

export type SpamReason = {
  code: string;
  label: string;
  score: number;
  severity: "low" | "medium" | "high";
};

type SourceTrustInput = {
  allowedDomains: string[];
  checkedDomains: string[];
  matchedDomain: string | null;
  sourceUrl?: string | null;
  originHeader?: string | null;
  refererHeader?: string | null;
};

type ContactQualityInput = {
  formType: FormType;
  submitterName?: string;
  submitterEmail?: string;
  submitterPhone?: string;
  messagePreview?: string;
};

export type SpamAssessment = {
  spamScore: number;
  spamStatus: SpamStatus;
  spamBucket: SpamBucket;
  reasons: SpamReason[];
  minimumStatus: Exclude<SpamStatus, "BLOCKED">;
};

export type NotificationDecision = {
  shouldNotify: boolean;
  notificationStatus: NotificationStatus;
  suppressedReason?: string;
};

const disposableEmailDomains = ["mailinator.com", "tempmail.com", "10minutemail.com"];
const scriptLikeUserAgents = ["curl", "wget", "python-requests", "httpclient", "bot/"];
const spamKeywordRules = [
  { code: "SEO_LINK_SPAM", label: "SEO or backlink spam language detected", score: 15, keywords: ["backlinks", "guest post", "da90"] },
  { code: "CRYPTO_SPAM", label: "Crypto or investment spam language detected", score: 20, keywords: ["crypto", "token presale", "blockchain investment"] },
  { code: "GAMBLING_SPAM", label: "Gambling or casino spam language detected", score: 20, keywords: ["casino", "betting", "gambling"] },
  { code: "PHARMA_SPAM", label: "Pharmaceutical spam language detected", score: 20, keywords: ["viagra", "levitra", "cialis"] },
  { code: "PHISHING_LANGUAGE", label: "Possible phishing or invoice scam language detected", score: 35, keywords: ["urgent payment", "bank details", "invoice attached"] },
];

function pushReason(
  reasons: SpamReason[],
  reason: SpamReason,
  categoryTotals: Map<string, number>,
  category: string,
  categoryCap: number,
) {
  const nextTotal = (categoryTotals.get(category) ?? 0) + reason.score;
  if ((categoryTotals.get(category) ?? 0) >= categoryCap) {
    return;
  }

  const appliedScore = Math.min(reason.score, categoryCap - (categoryTotals.get(category) ?? 0));
  categoryTotals.set(category, nextTotal);
  reasons.push({
    ...reason,
    score: appliedScore,
  });
}

function countLinks(text: string) {
  const matches = text.match(/https?:\/\//gi);
  return matches?.length ?? 0;
}

function extractEmail(value: string | undefined) {
  if (!value) {
    return null;
  }

  return value.toLowerCase();
}

function isValidEmail(value: string | undefined) {
  if (!value) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidPhone(value: string | undefined) {
  if (!value) {
    return false;
  }

  return /^[+0-9()\-\s]{7,}$/.test(value);
}

function normalizedFlatText(fields: Record<string, unknown>) {
  return Object.values(fields)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .map((value) => String(value ?? ""))
    .join(" ")
    .trim();
}

function detectHoneypotField(
  fields: Record<string, unknown>,
  configuredHoneypotFieldName?: string | null,
) {
  const candidates = new Set([
    configuredHoneypotFieldName,
    "_company_website",
    "_website_url",
    "_fax_number",
  ].filter(Boolean) as string[]);

  for (const key of Object.keys(fields)) {
    if (key.startsWith("_hp_")) {
      candidates.add(key);
    }
  }

  for (const candidate of candidates) {
    if (!(candidate in fields)) {
      continue;
    }

    const value = fields[candidate];
    const normalizedValue = Array.isArray(value) ? value.join(", ").trim() : String(value ?? "").trim();
    return {
      fieldName: candidate,
      filled: normalizedValue.length > 0,
    };
  }

  return null;
}

function evaluateSourceTrust(
  input: SourceTrustInput,
  mode: WebsiteProtectionMode,
  categoryTotals: Map<string, number>,
  reasons: SpamReason[],
) {
  const originDomain = input.originHeader ? (() => {
    try {
      return new URL(input.originHeader).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      return null;
    }
  })() : null;
  const refererDomain = input.refererHeader ? (() => {
    try {
      return new URL(input.refererHeader).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      return null;
    }
  })() : null;
  const sourceDomain = input.sourceUrl ? (() => {
    try {
      return new URL(input.sourceUrl).hostname.toLowerCase().replace(/^www\./, "");
    } catch {
      return null;
    }
  })() : null;

  const isAllowed = (domain: string | null) =>
    Boolean(
      domain &&
        input.allowedDomains.some((allowedDomain) => domain === allowedDomain || domain.endsWith(`.${allowedDomain}`)),
    );

  const originMatches = isAllowed(originDomain);
  const refererMatches = isAllowed(refererDomain);
  const sourceMatches = isAllowed(sourceDomain);

  if (originMatches) {
    pushReason(reasons, {
      code: "ORIGIN_MATCHED",
      label: "Origin matched an allowed website",
      score: -15,
      severity: "low",
    }, categoryTotals, "origin", 40);
  }

  if (refererMatches) {
    pushReason(reasons, {
      code: "REFERER_MATCHED",
      label: "Referrer matched an allowed website",
      score: -10,
      severity: "low",
    }, categoryTotals, "origin", 40);
  }

  if (sourceMatches) {
    pushReason(reasons, {
      code: "SOURCE_URL_MATCHED",
      label: "Reported source page matched an allowed website",
      score: -5,
      severity: "low",
    }, categoryTotals, "origin", 40);
  }

  if (!originDomain && !refererDomain) {
    pushReason(reasons, {
      code: "MISSING_SOURCE_HEADERS",
      label: "Origin and referrer headers were both missing",
      score: 5,
      severity: "low",
    }, categoryTotals, "origin", 40);
  }

  if (originDomain && !originMatches) {
    pushReason(reasons, {
      code: "ORIGIN_MISMATCH",
      label: "Origin did not match the allowed websites",
      score: 25,
      severity: "medium",
    }, categoryTotals, "origin", 40);
  }

  if (refererDomain && !refererMatches) {
    pushReason(reasons, {
      code: "REFERER_MISMATCH",
      label: "Referrer did not match the allowed websites",
      score: 15,
      severity: "medium",
    }, categoryTotals, "origin", 40);
  }

  if (
    originDomain &&
    refererDomain &&
    !originMatches &&
    !refererMatches &&
    mode !== "OPEN"
  ) {
    pushReason(reasons, {
      code: "ORIGIN_REFERER_BOTH_MISMATCH",
      label: "Origin and referrer both mismatched the allowed websites",
      score: 40,
      severity: "high",
    }, categoryTotals, "origin", 40);
  }

  const strictMismatch =
    mode === "STRICT" &&
    !originMatches &&
    !refererMatches &&
    !sourceMatches &&
    Boolean(originDomain || refererDomain || sourceDomain);

  return {
    strictMismatch,
  };
}

function evaluateBotSignals(
  input: {
    fields: Record<string, unknown>;
    userAgent: string | null;
    loadedAt?: string;
    configuredHoneypotFieldName?: string | null;
  },
  categoryTotals: Map<string, number>,
  reasons: SpamReason[],
) {
  let minimumStatus: Exclude<SpamStatus, "BLOCKED"> = "CLEAN";
  const honeypot = detectHoneypotField(input.fields, input.configuredHoneypotFieldName);

  if (honeypot?.filled) {
    pushReason(reasons, {
      code: "HONEYPOT_FILLED",
      label: "Hidden anti-spam field was filled",
      score: 45,
      severity: "high",
    }, categoryTotals, "bot", 60);
    minimumStatus = "SUSPICIOUS";
  } else if (honeypot && !honeypot.filled) {
    pushReason(reasons, {
      code: "HONEYPOT_PRESENT_EMPTY",
      label: "Hidden anti-spam field was present and empty",
      score: -10,
      severity: "low",
    }, categoryTotals, "bot", 60);
  }

  if (!input.userAgent) {
    pushReason(reasons, {
      code: "USER_AGENT_MISSING",
      label: "User agent header was missing",
      score: 15,
      severity: "medium",
    }, categoryTotals, "bot", 60);
  } else if (
    scriptLikeUserAgents.some((pattern) =>
      input.userAgent ? input.userAgent.toLowerCase().includes(pattern) : false,
    )
  ) {
    pushReason(reasons, {
      code: "SCRIPT_USER_AGENT",
      label: "User agent looked like an automated script",
      score: 35,
      severity: "high",
    }, categoryTotals, "bot", 60);
  }

  if (input.loadedAt) {
    const loadedAtTime = Number(input.loadedAt);
    if (Number.isFinite(loadedAtTime)) {
      const seconds = (Date.now() - loadedAtTime) / 1000;
      if (seconds < 1) {
        pushReason(reasons, {
          code: "SUBMITTED_TOO_FAST_1S",
          label: "Submission arrived in under 1 second",
          score: 35,
          severity: "high",
        }, categoryTotals, "bot", 60);
      } else if (seconds < 2) {
        pushReason(reasons, {
          code: "SUBMITTED_TOO_FAST_2S",
          label: "Submission arrived in under 2 seconds",
          score: 20,
          severity: "medium",
        }, categoryTotals, "bot", 60);
      }
    }
  }

  return minimumStatus;
}

function evaluateContactQuality(
  input: ContactQualityInput,
  categoryTotals: Map<string, number>,
  reasons: SpamReason[],
) {
  if (input.submitterName) {
    pushReason(reasons, {
      code: "NAME_DETECTED",
      label: "A sender name was detected",
      score: -5,
      severity: "low",
    }, categoryTotals, "contact", 30);
  }

  if (isValidEmail(input.submitterEmail)) {
    pushReason(reasons, {
      code: "VALID_EMAIL",
      label: "A valid email address was detected",
      score: -10,
      severity: "low",
    }, categoryTotals, "contact", 30);
  } else if (input.submitterEmail) {
    pushReason(reasons, {
      code: "INVALID_EMAIL",
      label: "The detected email address looked invalid",
      score: 15,
      severity: "medium",
    }, categoryTotals, "contact", 30);
  }

  if (isValidPhone(input.submitterPhone)) {
    pushReason(reasons, {
      code: "VALID_PHONE",
      label: "A valid phone number was detected",
      score: -8,
      severity: "low",
    }, categoryTotals, "contact", 30);
  }

  if (input.messagePreview && input.messagePreview.length >= 20 && input.messagePreview.length <= 1500) {
    pushReason(reasons, {
      code: "HUMAN_LENGTH_MESSAGE",
      label: "The message looked like a normal human-length message",
      score: -5,
      severity: "low",
    }, categoryTotals, "contact", 30);
  }

  const email = extractEmail(input.submitterEmail ?? undefined);
  const disposableDomain = email?.split("@")[1];
  if (disposableDomain && disposableEmailDomains.includes(disposableDomain)) {
    pushReason(reasons, {
      code: "DISPOSABLE_EMAIL",
      label: "The sender used a disposable email domain",
      score: 20,
      severity: "medium",
    }, categoryTotals, "contact", 30);
  }

  const shouldRequireContact =
    input.formType === "CONTACT" || input.formType === "QUOTE_REQUEST" || input.formType === "BOOKING_ENQUIRY";

  if (shouldRequireContact && !isValidEmail(input.submitterEmail) && !isValidPhone(input.submitterPhone)) {
    pushReason(reasons, {
      code: "NO_CONTACT_METHOD",
      label: "No reliable email or phone number was detected for this form type",
      score: 15,
      severity: "medium",
    }, categoryTotals, "contact", 30);
  }
}

function evaluateContentSignals(
  fields: Record<string, unknown>,
  categoryTotals: Map<string, number>,
  reasons: SpamReason[],
) {
  const text = normalizedFlatText(fields);
  const linkCount = countLinks(text);

  if (linkCount === 1) {
    pushReason(reasons, {
      code: "ONE_LINK",
      label: "Message contained one link",
      score: 5,
      severity: "low",
    }, categoryTotals, "content", 50);
  } else if (linkCount === 2) {
    pushReason(reasons, {
      code: "TWO_LINKS",
      label: "Message contained two links",
      score: 10,
      severity: "medium",
    }, categoryTotals, "content", 50);
  } else if (linkCount >= 3 && linkCount <= 5) {
    pushReason(reasons, {
      code: "TOO_MANY_LINKS",
      label: `Message contained ${linkCount} links`,
      score: 20,
      severity: "medium",
    }, categoryTotals, "content", 50);
  } else if (linkCount > 5) {
    pushReason(reasons, {
      code: "EXCESSIVE_LINKS",
      label: `Message contained ${linkCount} links`,
      score: 35,
      severity: "high",
    }, categoryTotals, "content", 50);
  }

  for (const rule of spamKeywordRules) {
    if (rule.keywords.some((keyword) => text.toLowerCase().includes(keyword))) {
      pushReason(reasons, {
        code: rule.code,
        label: rule.label,
        score: rule.score,
        severity: rule.score >= 30 ? "high" : "medium",
      }, categoryTotals, "content", 50);
    }
  }

  if (/<script|<\/script>|<iframe|javascript:/i.test(text)) {
    pushReason(reasons, {
      code: "SCRIPT_TAGS_DETECTED",
      label: "Message contained HTML or script-like tags",
      score: 30,
      severity: "high",
    }, categoryTotals, "content", 50);
  }

  if (/(select\s+\*\s+from|drop\s+table|union\s+select|<script>)/i.test(text)) {
    pushReason(reasons, {
      code: "ATTACK_STRING_DETECTED",
      label: "Message contained SQL or script attack patterns",
      score: 40,
      severity: "high",
    }, categoryTotals, "content", 50);
  }
}

function calculateThresholds(spamProtectionLevel: string) {
  const level = spamProtectionLevel.toUpperCase();

  if (level === "RELAXED" || level === "BASIC") {
    return {
      cleanMax: 49,
      suspiciousMax: 84,
    };
  }

  if (level === "STRICT") {
    return {
      cleanMax: 29,
      suspiciousMax: 59,
    };
  }

  return {
    cleanMax: 39,
    suspiciousMax: 74,
  };
}

function deriveBucket(status: SpamStatus, score: number) {
  if (status === "SPAM") {
    return "SPAM" satisfies SpamBucket;
  }

  if (status === "SUSPICIOUS" && score >= 60) {
    return "SUSPICIOUS" satisfies SpamBucket;
  }

  return "INBOX" satisfies SpamBucket;
}

export function assessSubmissionSpam(input: {
  fields: Record<string, unknown>;
  fieldItems: NormalizedFieldItem[];
  userAgent: string | null;
  sourceTrust: SourceTrustInput;
  formType: FormType;
  spamProtectionLevel: string;
  websiteProtectionMode: WebsiteProtectionMode;
  submitterName?: string;
  submitterEmail?: string;
  submitterPhone?: string;
  messagePreview?: string;
  rateReasons?: SpamReason[];
  fieldCount?: number;
  payloadSize?: number | null;
  configuredHoneypotFieldName?: string | null;
}): SpamAssessment {
  const reasons: SpamReason[] = [];
  const categoryTotals = new Map<string, number>();
  let minimumStatus: Exclude<SpamStatus, "BLOCKED"> = "CLEAN";

  if ((input.fieldCount ?? 0) > 30) {
    pushReason(reasons, {
      code: "HIGH_FIELD_COUNT",
      label: "Submission contained more than 30 fields",
      score: 10,
      severity: "medium",
    }, categoryTotals, "endpoint", 20);
  }

  if ((input.payloadSize ?? 0) > 200 * 1024) {
    pushReason(reasons, {
      code: "PAYLOAD_NEAR_LIMIT",
      label: "Submission payload was close to the size limit",
      score: 10,
      severity: "medium",
    }, categoryTotals, "endpoint", 20);
  }

  for (const rateReason of input.rateReasons ?? []) {
    pushReason(reasons, rateReason, categoryTotals, "behavior", 70);
  }

  if (
    (input.rateReasons ?? []).some((reason) =>
      ["EXACT_DUPLICATE_2_MINUTES", "IP_HITTING_MANY_FORMS"].includes(reason.code),
    )
  ) {
    minimumStatus = "SUSPICIOUS";
  }

  const sourceEvaluation = evaluateSourceTrust(
    input.sourceTrust,
    input.websiteProtectionMode,
    categoryTotals,
    reasons,
  );

  if (sourceEvaluation.strictMismatch) {
    minimumStatus = "SPAM";
  }

  const loadedAtValue = input.fields._fr_loaded_at;
  const loadedAt =
    typeof loadedAtValue === "string"
      ? loadedAtValue
      : Array.isArray(loadedAtValue)
        ? String(loadedAtValue[0] ?? "")
        : undefined;

  const botMinimumStatus = evaluateBotSignals(
    {
      fields: input.fields,
      userAgent: input.userAgent,
      loadedAt,
      configuredHoneypotFieldName: input.configuredHoneypotFieldName,
    },
    categoryTotals,
    reasons,
  );

  if (botMinimumStatus === "SUSPICIOUS") {
    minimumStatus = "SUSPICIOUS";
  }

  evaluateContactQuality(
    {
      formType: input.formType,
      submitterName: input.submitterName,
      submitterEmail: input.submitterEmail,
      submitterPhone: input.submitterPhone,
      messagePreview: input.messagePreview,
    },
    categoryTotals,
    reasons,
  );

  evaluateContentSignals(input.fields, categoryTotals, reasons);

  const totalScore = reasons.reduce((sum, reason) => sum + reason.score, 0);
  const spamScore = Math.max(0, Math.min(100, totalScore));
  const thresholds = calculateThresholds(input.spamProtectionLevel);

  let spamStatus: SpamStatus;
  if (spamScore <= thresholds.cleanMax) {
    spamStatus = "CLEAN";
  } else if (spamScore <= thresholds.suspiciousMax) {
    spamStatus = "SUSPICIOUS";
  } else {
    spamStatus = "SPAM";
  }

  if (minimumStatus === "SUSPICIOUS" && spamStatus === "CLEAN") {
    spamStatus = "SUSPICIOUS";
  }

  if (minimumStatus === "SPAM") {
    spamStatus = "SPAM";
  }

  return {
    spamScore,
    spamStatus,
    spamBucket: deriveBucket(spamStatus, spamScore),
    reasons,
    minimumStatus,
  };
}

export function decideNotification(input: {
  spamStatus: SpamStatus;
  spamScore: number;
  spamBucket: SpamBucket;
  notifyOnLowSuspicious: boolean;
  notifyOnSuspicious: boolean;
  notifyOnSpam: boolean;
}): NotificationDecision {
  if (input.spamStatus === "CLEAN") {
    return {
      shouldNotify: true,
      notificationStatus: "QUEUED",
    } satisfies NotificationDecision;
  }

  if (input.spamStatus === "SUSPICIOUS") {
    if (input.spamScore < 60) {
      return input.notifyOnLowSuspicious
        ? {
            shouldNotify: true,
            notificationStatus: "QUEUED",
          }
        : {
            shouldNotify: false,
            notificationStatus: "SUPPRESSED_SUSPICIOUS",
            suppressedReason: "Low-risk suspicious notifications are disabled for this form.",
          };
    }

    return input.notifyOnSuspicious
      ? {
          shouldNotify: true,
          notificationStatus: "QUEUED",
        }
      : {
          shouldNotify: false,
          notificationStatus: "SUPPRESSED_SUSPICIOUS",
          suppressedReason: "High-risk suspicious notifications are disabled for this form.",
        };
  }

  if (input.spamStatus === "SPAM") {
    return input.notifyOnSpam
      ? {
          shouldNotify: true,
          notificationStatus: "QUEUED",
        }
      : {
          shouldNotify: false,
          notificationStatus: "SUPPRESSED_SPAM",
          suppressedReason: "Spam notifications are suppressed by default.",
        };
  }

  return {
    shouldNotify: false,
    notificationStatus: "NOT_APPLICABLE",
    suppressedReason: "Blocked requests are never notified.",
  } satisfies NotificationDecision;
}
