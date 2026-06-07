"use server";

import { randomBytes } from "node:crypto";

import { redirect } from "next/navigation";
import { z } from "zod";

import { requireWorkspace } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type EntityFormState = {
  error?: string;
  message?: string;
};

const websiteSchema = z.object({
  websiteName: z.string().min(2, "Website name is required"),
  websiteUrl: z.url("Enter a valid website URL"),
  defaultRecipientEmail: z.string().email("Enter a valid recipient email"),
  allowedDomains: z.string().optional(),
  defaultSuccessRedirect: z.union([z.literal(""), z.url("Enter a valid success redirect URL")]).optional(),
  timezone: z.string().optional(),
});

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

  const parsed = websiteSchema.safeParse({
    websiteName: formData.get("websiteName"),
    websiteUrl: formData.get("websiteUrl"),
    defaultRecipientEmail: formData.get("defaultRecipientEmail"),
    allowedDomains: formData.get("allowedDomains"),
    defaultSuccessRedirect: formData.get("defaultSuccessRedirect"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check the website details",
    };
  }

  const allowedDomains = (parsed.data.allowedDomains ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  const website = await prisma.website.create({
    data: {
      workspaceId: workspace.id,
      websiteName: parsed.data.websiteName,
      websiteUrl: parsed.data.websiteUrl,
      defaultRecipientEmail: parsed.data.defaultRecipientEmail,
      allowedDomains,
      defaultSuccessRedirect: parsed.data.defaultSuccessRedirect || null,
      timezone: parsed.data.timezone || null,
    },
  });

  redirect(`/dashboard/websites/${website.id}`);
}

export async function createFormInboxAction(
  _prevState: EntityFormState,
  formData: FormData,
): Promise<EntityFormState> {
  const { workspace } = await requireWorkspace();

  const parsed = formSchema.safeParse({
    websiteId: formData.get("websiteId"),
    formName: formData.get("formName"),
    recipientEmails: formData.get("recipientEmails"),
    successRedirectUrl: formData.get("successRedirectUrl"),
    spamProtectionLevel: formData.get("spamProtectionLevel"),
    websiteProtectionMode: formData.get("websiteProtectionMode"),
    formType: formData.get("formType"),
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
