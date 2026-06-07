import { createHash } from "node:crypto";

export type NormalizedFieldItem = {
  key: string;
  label: string;
  type: string;
  value: string | string[];
};

export type DerivedFieldCandidates = {
  nameFieldKey?: string;
  emailFieldKey?: string;
  phoneFieldKey?: string;
  messageFieldKey?: string;
};

type SubmissionEnvelope = {
  fields: Record<string, unknown>;
  fieldItems: NormalizedFieldItem[];
  sourceUrl?: string | null;
  pageTitle?: string | null;
  formName?: string | null;
  referrer?: string | null;
  containsFiles: boolean;
};

const nameMatchers = ["name", "full_name", "fullname", "contact_name"];
const emailMatchers = ["email", "email_address", "contact_email"];
const phoneMatchers = ["phone", "phone_number", "mobile", "whatsapp", "telephone", "tel"];
const messageMatchers = ["message", "enquiry", "details", "description", "comments", "note", "request"];

function humanizeKey(key: string) {
  return key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeScalar(value: FormDataEntryValue | unknown): string | string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  if (value instanceof File) {
    return value.name;
  }

  return String(value ?? "");
}

function upsertValue(target: Record<string, unknown>, key: string, value: FormDataEntryValue) {
  const currentValue = target[key];

  if (currentValue === undefined) {
    target[key] = value;
    return;
  }

  if (Array.isArray(currentValue)) {
    currentValue.push(value);
    return;
  }

  target[key] = [currentValue, value];
}

function extractBestMatch(fields: Record<string, unknown>, matchers: string[]) {
  const entry = Object.entries(fields).find(([key]) =>
    matchers.some((matcher) => key.toLowerCase().includes(matcher)),
  );

  if (!entry) {
    return undefined;
  }

  const value = normalizeScalar(entry[1]);
  return Array.isArray(value) ? value.join(", ") : value;
}

export async function parseSubmissionRequest(request: Request): Promise<SubmissionEnvelope> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await request.json()) as Record<string, unknown>;

    const rawFields =
      payload.fields && typeof payload.fields === "object" && !Array.isArray(payload.fields)
        ? (payload.fields as Record<string, unknown>)
        : payload;

    const fieldItems = Array.isArray(payload.field_items)
      ? (payload.field_items as NormalizedFieldItem[])
      : Object.entries(rawFields).map(([key, value]) => ({
          key,
          label: humanizeKey(key),
          type: Array.isArray(value) ? "multi_value" : "text",
          value: normalizeScalar(value),
        }));

    return {
      fields: rawFields,
      fieldItems,
      sourceUrl: typeof payload.source_url === "string" ? payload.source_url : null,
      pageTitle: typeof payload.page_title === "string" ? payload.page_title : null,
      formName: typeof payload.form_name === "string" ? payload.form_name : null,
      referrer: typeof payload.referrer === "string" ? payload.referrer : null,
      containsFiles: false,
    };
  }

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData();
    const fields: Record<string, unknown> = {};
    let containsFiles = false;

    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        containsFiles = true;
      }
      upsertValue(fields, key, value);
    }

    return {
      fields,
      fieldItems: Object.entries(fields).map(([key, value]) => ({
        key,
        label: humanizeKey(key),
        type: Array.isArray(value) ? "multi_value" : "text",
        value: normalizeScalar(value),
      })),
      sourceUrl: typeof fields.source_url === "string" ? String(fields.source_url) : null,
      pageTitle: typeof fields.page_title === "string" ? String(fields.page_title) : null,
      formName: typeof fields.form_name === "string" ? String(fields.form_name) : null,
      referrer: typeof fields.referrer === "string" ? String(fields.referrer) : null,
      containsFiles,
    };
  }

  throw new Error("Unsupported content type");
}

function valueForKey(fields: Record<string, unknown>, key?: string | null) {
  if (!key) {
    return undefined;
  }

  const value = fields[key];
  if (value === undefined) {
    return undefined;
  }

  const normalized = normalizeScalar(value);
  return Array.isArray(normalized) ? normalized.join(", ") : normalized;
}

export function deriveSubmissionSummary(
  fields: Record<string, unknown>,
  mappings?: {
    nameFieldKey?: string | null;
    emailFieldKey?: string | null;
    phoneFieldKey?: string | null;
    messageFieldKey?: string | null;
  },
) {
  const submitterName =
    valueForKey(fields, mappings?.nameFieldKey) ?? extractBestMatch(fields, nameMatchers);
  const submitterEmail =
    valueForKey(fields, mappings?.emailFieldKey) ?? extractBestMatch(fields, emailMatchers);
  const submitterPhone =
    valueForKey(fields, mappings?.phoneFieldKey) ?? extractBestMatch(fields, phoneMatchers);
  const messagePreview =
    valueForKey(fields, mappings?.messageFieldKey) ?? extractBestMatch(fields, messageMatchers);

  return {
    submitterName,
    submitterEmail,
    submitterPhone,
    messagePreview: messagePreview?.slice(0, 240),
  };
}

export function deriveFieldCandidates(fieldItems: NormalizedFieldItem[]): DerivedFieldCandidates {
  const findByMatchers = (matchers: string[]) =>
    fieldItems.find((item) =>
      matchers.some((matcher) => item.key.toLowerCase().includes(matcher)),
    )?.key;

  return {
    nameFieldKey: findByMatchers(nameMatchers),
    emailFieldKey: findByMatchers(emailMatchers),
    phoneFieldKey: findByMatchers(phoneMatchers),
    messageFieldKey: findByMatchers(messageMatchers),
  };
}

export function countTruthyFields(fields: Record<string, unknown>) {
  return Object.entries(fields).filter(([, value]) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return String(value ?? "").trim().length > 0;
  }).length;
}

export function hashIpAddress(ipAddress: string | null) {
  if (!ipAddress) {
    return null;
  }

  return createHash("sha256").update(ipAddress).digest("hex");
}

function flattenScalarValues(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenScalarValues(item));
  }

  if (value === null || value === undefined) {
    return [];
  }

  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      flattenScalarValues(item),
    );
  }

  return [String(value)];
}

export function getSubmissionShapeMetrics(fields: Record<string, unknown>) {
  let maxFieldKeyLength = 0;
  let maxJsonDepth = 1;
  let totalTextLength = 0;
  let hasOverlongValue = false;

  const visit = (value: unknown, depth: number) => {
    maxJsonDepth = Math.max(maxJsonDepth, depth);

    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item, depth + 1);
      }
      return;
    }

    if (value && typeof value === "object") {
      for (const [nestedKey, nestedValue] of Object.entries(value as Record<string, unknown>)) {
        maxFieldKeyLength = Math.max(maxFieldKeyLength, nestedKey.length);
        visit(nestedValue, depth + 1);
      }
      return;
    }

    const normalized = String(value ?? "");
    totalTextLength += normalized.length;
    if (normalized.length > 10_000) {
      hasOverlongValue = true;
    }
  };

  for (const [key, value] of Object.entries(fields)) {
    maxFieldKeyLength = Math.max(maxFieldKeyLength, key.length);
    visit(value, 1);
  }

  return {
    maxFieldKeyLength,
    maxJsonDepth,
    totalTextLength,
    hasOverlongValue,
    flattenedValues: flattenScalarValues(fields),
  };
}
