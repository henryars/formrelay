import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { env } from "@/lib/env";

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

export async function sendSubmissionEmail(input: {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  if (!input.to.length) {
    return { skipped: true as const };
  }

  const command = new SendEmailCommand({
    FromEmailAddress: env.AWS_SES_FROM_EMAIL,
    Destination: {
      ToAddresses: input.to,
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
        },
      },
    },
  });

  const response = await sesClient.send(command);

  return {
    skipped: false as const,
    messageId: response.MessageId,
  };
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
      return `<tr><td style="padding:8px 0;font-weight:600;">${item.label}</td><td style="padding:8px 0;">${value}</td></tr>`;
    })
    .join("");

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;padding:24px;color:#0f0f0f;">
      <h2 style="margin:0 0 12px;">New submission from ${input.formName}</h2>
      <p style="margin:0 0 20px;">Website: ${input.websiteName}</p>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
      ${
        input.sourceUrl
          ? `<p style="margin-top:20px;">Source page: <a href="${input.sourceUrl}">${input.sourceUrl}</a></p>`
          : ""
      }
    </div>
  `;
}
