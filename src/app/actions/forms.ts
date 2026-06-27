"use server";

import { randomBytes } from "node:crypto";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidEmail, normalizeUrl, parseEmailList } from "@/lib/utils";

export type EntityFormState = {
  error?: string;
  message?: string;
};

const websiteSchema = z.object({
  websiteName: z.string().min(2, "Website name is required"),
  websiteUrl: z.url("Enter a valid website URL"),
  defaultRecipientEmails: z.string().min(3, "At least one notification email is required"),
  allowedDomains: z.string().optional(),
  defaultSuccessRedirect: z.union([z.literal(""), z.url("Enter a valid success redirect URL")]).optional(),
  timezone: z.string().optional(),
});

type WebsiteData = {
  websiteName: string;
  websiteUrl: string;
  defaultRecipientEmails: string[];
  allowedDomains: string[];
  defaultSuccessRedirect: string | null;
  timezone: string | null;
};

// Shared parsing for create / onboarding / update — normalizes the URL (so a
// scheme-less "mysite.com" is accepted) and validates the comma-separated emails.
function parseWebsiteFormData(
  formData: FormData,
): { error: string } | { data: WebsiteData } {
  // formData.get() returns null for fields not present in the submitted form
  // (e.g. collapsed "Advanced options"). Zod's .optional() rejects null, so
  // coerce every value to a string first.
  const str = (name: string) => (formData.get(name) as string | null) ?? "";
  const rawRedirect = str("defaultSuccessRedirect");

  const parsed = websiteSchema.safeParse({
    websiteName: str("websiteName"),
    websiteUrl: normalizeUrl(str("websiteUrl")),
    defaultRecipientEmails: str("defaultRecipientEmails"),
    allowedDomains: str("allowedDomains"),
    defaultSuccessRedirect: rawRedirect ? normalizeUrl(rawRedirect) : "",
    timezone: str("timezone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the website details" };
  }

  const defaultRecipientEmails = parseEmailList(parsed.data.defaultRecipientEmails);
  if (!defaultRecipientEmails.length) {
    return { error: "Add at least one notification email" };
  }
  const invalid = defaultRecipientEmails.find((email) => !isValidEmail(email));
  if (invalid) {
    return { error: `"${invalid}" is not a valid email address` };
  }

  const allowedDomains = (parsed.data.allowedDomains ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return {
    data: {
      websiteName: parsed.data.websiteName,
      websiteUrl: parsed.data.websiteUrl,
      defaultRecipientEmails,
      allowedDomains,
      defaultSuccessRedirect: parsed.data.defaultSuccessRedirect || null,
      timezone: parsed.data.timezone || null,
    },
  };
}

const formSchema = z.object({
  websiteId: z.string().min(1, "Choose a website"),
  formName: z.string().min(2, "Form name is required"),
  recipientEmails: z.string().min(3, "At least one recipient email is required"),
  successRedirectUrl: z.union([z.literal(""), z.url("Enter a valid success redirect URL")]).optional(),
  spamProtectionLevel: z.enum(["RELAXED", "STANDARD", "STRICT"]),
  websiteProtectionMode: z.enum(["OPEN", "STANDARD", "STRICT"]),
  formType: z.enum(["CONTACT", "QUOTE_REQUEST", "NEWSLETTER", "BOOKING_ENQUIRY", "WAITLIST", "OTHER"]),
});

const fieldMappingSchema = z.object({
  formId: z.string().min(1),
  nameFieldKey: z.string().optional(),
  emailFieldKey: z.string().optional(),
  phoneFieldKey: z.string().optional(),
  messageFieldKey: z.string().optional(),
});

const formProtectionSchema = z.object({
  formId: z.string().min(1),
  spamProtectionLevel: z.enum(["RELAXED", "STANDARD", "STRICT"]),
  websiteProtectionMode: z.enum(["OPEN", "STANDARD", "STRICT"]),
  formType: z.enum(["CONTACT", "QUOTE_REQUEST", "NEWSLETTER", "BOOKING_ENQUIRY", "WAITLIST", "OTHER"]),
  honeypotFieldName: z.string().trim().max(100).optional(),
  notifyOnLowSuspicious: z.enum(["true", "false"]),
  notifyOnSuspicious: z.enum(["true", "false"]),
  notifyOnSpam: z.enum(["true", "false"]),
  weeklySpamSummary: z.enum(["true", "false"]),
});

function generatePublicFormId() {
  return `fm_${randomBytes(6).toString("hex")}`;
}

function generateHoneypotFieldName(publicFormId: string) {
  return `_hp_${publicFormId.replace(/^fm_/, "")}`;
}

export async function createWebsiteAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const result = parseWebsiteFormData(formData);
  if ("error" in result) return { error: result.error };

  const website = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      ...result.data,
    },
  });

  redirect(`/dashboard/websites/${website.id}`);
}

// Onboarding variant — redirects back to onboarding flow after website creation
export async function createWebsiteOnboardingAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const result = parseWebsiteFormData(formData);
  if ("error" in result) return { error: result.error };

  await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      ...result.data,
    },
  });

  redirect("/dashboard/onboarding");
}

export async function createFormInboxAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  // formData.get() is null for fields absent from the submission (e.g. the
  // collapsed "Advanced options"); fall back to the same defaults the UI shows.
  const get = (name: string) => (formData.get(name) as string | null) ?? "";
  const parsed = formSchema.safeParse({
    websiteId: get("websiteId"),
    formName: get("formName"),
    recipientEmails: get("recipientEmails"),
    successRedirectUrl: get("successRedirectUrl"),
    spamProtectionLevel: get("spamProtectionLevel") || "STANDARD",
    websiteProtectionMode: get("websiteProtectionMode") || "STANDARD",
    formType: get("formType") || "CONTACT",
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the form details",
    };
  }

  const website = await prisma.website.findFirst({
    where: {
      id: parsed.data.websiteId,
      workspaceId: workspace.id,
    },
  });

  if (!website) {
    return {
      error: "That website does not belong to this workspace",
    };
  }

  const recipientEmails = parsed.data.recipientEmails
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!recipientEmails.length) {
    return {
      error: "Add at least one recipient email",
    };
  }

  const publicFormId = generatePublicFormId();
  const endpointUrl = `/f/${publicFormId}`;

  const form = await prisma.formInbox.create({
    data: {
      websiteId: website.id,
      formName: parsed.data.formName,
      publicFormId,
      endpointUrl,
      recipientEmails,
      successRedirectUrl: parsed.data.successRedirectUrl || null,
      spamProtectionLevel: parsed.data.spamProtectionLevel,
      websiteProtectionMode: parsed.data.websiteProtectionMode,
      formType: parsed.data.formType,
      honeypotFieldName: generateHoneypotFieldName(publicFormId),
    },
  });

  redirect(`/dashboard/forms/${form.id}`);
}

export async function updateFieldMappingAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const parsed = fieldMappingSchema.safeParse({
    formId: formData.get("formId"),
    nameFieldKey: formData.get("nameFieldKey") || undefined,
    emailFieldKey: formData.get("emailFieldKey") || undefined,
    phoneFieldKey: formData.get("phoneFieldKey") || undefined,
    messageFieldKey: formData.get("messageFieldKey") || undefined,
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your field mapping",
    };
  }

  const form = await prisma.formInbox.findFirst({
    where: {
      id: parsed.data.formId,
      website: {
        workspaceId: workspace.id,
      },
    },
  });

  if (!form) {
    return {
      error: "This form inbox was not found",
    };
  }

  await prisma.formInbox.update({
    where: {
      id: form.id,
    },
    data: {
      nameFieldKey: parsed.data.nameFieldKey || null,
      emailFieldKey: parsed.data.emailFieldKey || null,
      phoneFieldKey: parsed.data.phoneFieldKey || null,
      messageFieldKey: parsed.data.messageFieldKey || null,
    },
  });

  return {
    message: "Field mapping saved.",
  };
}

export async function updateWebsiteAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const websiteId = formData.get("websiteId") as string;
  if (!websiteId) return { error: "Missing website ID" };

  const result = parseWebsiteFormData(formData);
  if ("error" in result) return { error: result.error };

  const website = await prisma.website.findFirst({
    where: { id: websiteId, workspaceId: workspace.id },
  });

  if (!website) return { error: "Website not found" };

  await prisma.website.update({
    where: { id: websiteId },
    data: result.data,
  });

  return { message: "Website updated." };
}

const formInboxSettingsSchema = z.object({
  formId: z.string().min(1),
  formName: z.string().min(2, "Form name is required"),
  recipientEmails: z.string().min(3, "At least one recipient email is required"),
  successRedirectUrl: z.union([z.literal(""), z.url("Enter a valid success redirect URL")]).optional(),
});

export async function updateFormInboxSettingsAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const parsed = formInboxSettingsSchema.safeParse({
    formId: formData.get("formId"),
    formName: formData.get("formName"),
    recipientEmails: formData.get("recipientEmails"),
    successRedirectUrl: formData.get("successRedirectUrl"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form details" };
  }

  const form = await prisma.formInbox.findFirst({
    where: { id: parsed.data.formId, website: { workspaceId: workspace.id } },
  });

  if (!form) return { error: "Form inbox not found" };

  const recipientEmails = parsed.data.recipientEmails
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean);

  if (!recipientEmails.length) return { error: "Add at least one recipient email" };

  await prisma.formInbox.update({
    where: { id: form.id },
    data: {
      formName: parsed.data.formName,
      recipientEmails,
      successRedirectUrl: parsed.data.successRedirectUrl || null,
    },
  });

  return { message: "Form settings saved." };
}

export async function updateFormProtectionSettingsAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const parsed = formProtectionSchema.safeParse({
    formId: formData.get("formId"),
    spamProtectionLevel: formData.get("spamProtectionLevel"),
    websiteProtectionMode: formData.get("websiteProtectionMode"),
    formType: formData.get("formType"),
    honeypotFieldName: formData.get("honeypotFieldName") || undefined,
    notifyOnLowSuspicious: formData.get("notifyOnLowSuspicious"),
    notifyOnSuspicious: formData.get("notifyOnSuspicious"),
    notifyOnSpam: formData.get("notifyOnSpam"),
    weeklySpamSummary: formData.get("weeklySpamSummary"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the protection settings",
    };
  }

  const form = await prisma.formInbox.findFirst({
    where: {
      id: parsed.data.formId,
      website: {
        workspaceId: workspace.id,
      },
    },
  });

  if (!form) {
    return {
      error: "This form inbox was not found",
    };
  }

  await prisma.formInbox.update({
    where: {
      id: form.id,
    },
    data: {
      spamProtectionLevel: parsed.data.spamProtectionLevel,
      websiteProtectionMode: parsed.data.websiteProtectionMode,
      formType: parsed.data.formType,
      honeypotFieldName:
        parsed.data.honeypotFieldName?.trim() || generateHoneypotFieldName(form.publicFormId),
      notifyOnLowSuspicious: parsed.data.notifyOnLowSuspicious === "true",
      notifyOnSuspicious: parsed.data.notifyOnSuspicious === "true",
      notifyOnSpam: parsed.data.notifyOnSpam === "true",
      weeklySpamSummary: parsed.data.weeklySpamSummary === "true",
    },
  });

  return {
    message: "Protection settings saved.",
  };
}
