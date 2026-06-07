import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const sesClient = new SESv2Client({
  region: env.AWS_REGION,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

type SendEmailInput = {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  fromEmail?: string;
};

export type SendEmailResult = {
  skipped: boolean;
  messageId?: string;
  acceptedRecipients: string[];
  suppressedRecipients: string[];
  skippedReason?: string;
  suppressionReason?: string;
};

function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase();
}

function uniqueEmails(addresses: string[]) {
  return [...new Set(addresses.map(normalizeEmailAddress).filter(Boolean))];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderEmailShell(input: {
  eyebrow: string;
  title: string;
  intro: string;
  bodyHtml: string;
  footer?: string;
}) {
  return `
    <div style="background:#f3f6fb;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:18px;padding:32px;border:1px solid #d9e2f2;">
        <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#315efb;">
          ${escapeHtml(input.eyebrow)}
        </p>
        <h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#111827;">
          ${escapeHtml(input.title)}
        </h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#374151;">
          ${escapeHtml(input.intro)}
        </p>
        ${input.bodyHtml}
        ${
          input.footer
            ? `<p style="margin:24px 0 0;font-size:13px;line-height:1.7;color:#6b7280;">${escapeHtml(
                input.footer,
              )}</p>`
            : ""
        }
      </div>
    </div>
  `;
}

async function partitionSuppressedRecipients(recipients: string[]) {
  const normalizedRecipients = uniqueEmails(recipients);

  if (!normalizedRecipients.length) {
    return {
      deliverableRecipients: [] as string[],
      suppressedRecipients: [] as string[],
    };
  }

  const suppressions = await prisma.emailSuppression.findMany({
    where: {
      recipientEmail: {
        in: normalizedRecipients,
      },
    },
  });

  const suppressedSet = new Set(suppressions.map((entry) => entry.recipientEmail.toLowerCase()));

  return {
    deliverableRecipients: normalizedRecipients.filter((email) => !suppressedSet.has(email)),
    suppressedRecipients: normalizedRecipients.filter((email) => suppressedSet.has(email)),
  };
}

async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const normalizedRecipients = uniqueEmails(input.to);

  if (!normalizedRecipients.length) {
    return {
      skipped: true,
      acceptedRecipients: [],
      suppressedRecipients: [],
      skippedReason: "No recipient emails were configured.",
    };
  }

  const { deliverableRecipients, suppressedRecipients } =
    await partitionSuppressedRecipients(normalizedRecipients);

  if (!deliverableRecipients.length) {
    return {
      skipped: true,
      acceptedRecipients: [],
      suppressedRecipients,
      skippedReason: "Every intended recipient is currently suppressed due to SES feedback.",
      suppressionReason: "All recipients are suppressed due to prior SES bounce or complaint events.",
    };
  }

  const command = new SendEmailCommand({
    FromEmailAddress: input.fromEmail ?? env.AWS_SES_FROM_EMAIL,
    ConfigurationSetName: env.AWS_SES_CONFIGURATION_SET,
    Destination: {
      ToAddresses: deliverableRecipients,
    },
    ReplyToAddresses: input.replyTo ? [input.replyTo] : undefined,
    Content: {
      Simple: {
        Subject: {
          Data: input.subject,
        },
        Body: {
          Html: {
            Data: input.html,
          },
          Text: input.text
            ? {
                Data: input.text,
              }
            : undefined,
        },
      },
    },
  });

  const response = await sesClient.send(command);

  return {
    skipped: false,
    messageId: response.MessageId,
    acceptedRecipients: deliverableRecipients,
    suppressedRecipients,
    suppressionReason: suppressedRecipients.length
      ? "Some recipients were skipped because SES previously bounced or complained for those addresses."
      : undefined,
  };
}

export async function sendSubmissionEmail(input: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  return sendEmail({
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });
}

export async function sendPasswordResetEmail(input: {
  to: string;
  resetUrl: string;
  fullName?: string | null;
}) {
  const subject = "Reset your FormRelay password";
  const html = renderPasswordResetEmail(input);
  const greeting = input.fullName ? `Hi ${input.fullName},` : "Hi,";
  const text = [
    `${greeting}`,
    "",
    "We received a request to reset your FormRelay password.",
    `Use this link to choose a new password: ${input.resetUrl}`,
    "",
    "This link expires in 1 hour. If you did not request it, you can ignore this email.",
  ].join("\n");

  return sendEmail({
    to: [input.to],
    subject,
    html,
    text,
    fromEmail: env.AWS_SES_RESET_FROM_EMAIL || env.AWS_SES_FROM_EMAIL,
  });
}

export function renderSubmissionEmail(input: {
  websiteName: string;
  formName: string;
  fieldItems: Array<{ label: string; value: string | string[] }>;
  sourceUrl?: string | null;
}) {
  const rows = input.fieldItems
    .map((item) => {
      const value = Array.isArray(item.value) ? item.value.join(", ") : item.value;
      return `<tr><td style="padding:8px 0;font-weight:600;vertical-align:top;">${escapeHtml(item.label)}</td><td style="padding:8px 0;vertical-align:top;">${escapeHtml(value)}</td></tr>`;
    })
    .join("");

  return renderEmailShell({
    eyebrow: "FormRelay submission",
    title: `New submission from ${input.formName}`,
    intro: `A new lead just came in for ${input.websiteName}.`,
    bodyHtml: `
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      ${
        input.sourceUrl
          ? `<p style="margin-top:20px;font-size:14px;line-height:1.7;color:#374151;">Source page: <a href="${escapeHtml(
              input.sourceUrl,
            )}">${escapeHtml(input.sourceUrl)}</a></p>`
          : ""
      }
    `,
  });
}

export function renderPasswordResetEmail(input: {
  resetUrl: string;
  fullName?: string | null;
}) {
  const firstLine = input.fullName
    ? `Hi ${escapeHtml(input.fullName)}, we received a request to reset your password.`
    : "We received a request to reset your password.";

  return renderEmailShell({
    eyebrow: "FormRelay account",
    title: "Reset your password",
    intro: firstLine,
    bodyHtml: `
      <p style="margin:0 0 20px;font-size:16px;line-height:1.7;color:#374151;">
        Use the button below to choose a new password. This link expires in 1 hour.
      </p>
      <p style="margin:0 0 24px;">
        <a
          href="${escapeHtml(input.resetUrl)}"
          style="display:inline-block;background:#315efb;color:#ffffff;text-decoration:none;padding:14px 20px;border-radius:12px;font-weight:700;"
        >
          Reset password
        </a>
      </p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">
        If the button does not work, copy and paste this URL into your browser:
      </p>
      <p style="margin:8px 0 0;font-size:14px;line-height:1.7;word-break:break-word;">
        <a href="${escapeHtml(input.resetUrl)}">${escapeHtml(input.resetUrl)}</a>
      </p>
    `,
    footer: "If you did not request a password reset, you can ignore this email.",
  });
}
