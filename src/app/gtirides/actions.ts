"use server";

import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import { z } from "zod";

import { BRAND } from "./_data/config";

/**
 * Self-contained lead handler for the GTi Rides prototype.
 * Uses the project's existing AWS SES credentials (env) directly so the whole
 * feature can be deleted by removing `src/app/gtirides/` + `public/gtirides/`.
 */

const requestSchema = z.object({
  service: z.enum(["car", "jet", "cruise"]),
  subject: z.string().min(1).max(120),
  category: z.string().max(80).optional(),
  priceRange: z.string().max(80).optional(),
  city: z.string().min(1).max(80),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(6).max(40),
  email: z.string().email(),
  startDate: z.string().min(1).max(40),
  endDate: z.string().max(40).optional(),
  passengers: z.string().max(40).optional(),
  route: z.string().max(160).optional(),
  note: z.string().max(2000).optional(),
});

export type RideRequestInput = z.infer<typeof requestSchema>;

export type RideRequestResult = {
  ok: boolean;
  reference?: string;
  emailed?: boolean;
  error?: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function makeReference() {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  let rand = "";
  for (let i = 0; i < 3; i += 1) {
    rand += "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)];
  }
  return `GTI-${stamp}${rand}`;
}

const SERVICE_LABEL: Record<RideRequestInput["service"], string> = {
  car: "Ride request",
  jet: "Private jet enquiry",
  cruise: "Boat cruise enquiry",
};

function renderEmail(input: RideRequestInput, reference: string) {
  const rows: Array<[string, string | undefined]> = [
    ["Reference", reference],
    ["Service", SERVICE_LABEL[input.service]],
    [input.service === "car" ? "Vehicle" : "Experience", input.subject],
    ["Category", input.category],
    ["Indicative price", input.priceRange],
    ["City / pickup", input.city],
    ["Route", input.route],
    ["Passengers / guests", input.passengers],
    ["Start date", input.startDate],
    ["End date", input.endDate],
    ["Customer", input.fullName],
    ["Phone", input.phone],
    ["Email", input.email],
    ["Note", input.note],
  ];

  const body = rows
    .filter(([, v]) => v && v.trim().length)
    .map(
      ([label, value]) =>
        `<tr><td style="padding:9px 0;font-weight:700;color:#1E1A17;vertical-align:top;width:170px;">${escapeHtml(
          label,
        )}</td><td style="padding:9px 0;color:#3f3a34;vertical-align:top;">${escapeHtml(
          value as string,
        )}</td></tr>`,
    )
    .join("");

  return `
  <div style="background:#FAF8F1;padding:32px 16px;font-family:'Segoe UI',Arial,Helvetica,sans-serif;color:#1E1A17;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #ece6d8;">
      <div style="background:#1E1A17;padding:22px 28px;">
        <span style="display:inline-block;font-size:13px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#F5B301;">GTi Rides</span>
        <div style="color:#cfc9bd;font-size:12px;margin-top:2px;">Connecting Dreams</div>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 6px;font-size:21px;color:#1E1A17;">New ${escapeHtml(
          SERVICE_LABEL[input.service].toLowerCase(),
        )}</h1>
        <p style="margin:0 0 20px;font-size:14px;color:#6b655b;">A customer just submitted a request from the website.</p>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${body}</table>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid #ece6d8;font-size:12px;color:#9a9388;">
          Reply directly to this email to reach ${escapeHtml(input.fullName)}.
        </div>
      </div>
    </div>
  </div>`;
}

function renderText(input: RideRequestInput, reference: string) {
  return [
    `${SERVICE_LABEL[input.service]} — ${reference}`,
    `Item: ${input.subject}`,
    input.category ? `Category: ${input.category}` : "",
    input.priceRange ? `Indicative price: ${input.priceRange}` : "",
    `City/Pickup: ${input.city}`,
    input.route ? `Route: ${input.route}` : "",
    input.passengers ? `Passengers/Guests: ${input.passengers}` : "",
    `Start: ${input.startDate}`,
    input.endDate ? `End: ${input.endDate}` : "",
    `Name: ${input.fullName}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email}`,
    input.note ? `Note: ${input.note}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export async function submitRideRequest(input: RideRequestInput): Promise<RideRequestResult> {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }
  const data = parsed.data;
  const reference = makeReference();

  const fromEmail = process.env.AWS_SES_FROM_EMAIL;
  const toEmails = (process.env.GTI_NOTIFY_EMAIL || BRAND.notifyEmailFallback)
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  const hasCreds = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  // Best effort: the prototype always confirms to the user (WhatsApp is the
  // reliable channel); email delivery never blocks the booking flow.
  let emailed = false;
  if (fromEmail && hasCreds && toEmails.length) {
    try {
      const client = new SESv2Client({
        region: process.env.AWS_REGION || "us-east-1",
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        },
      });
      await client.send(
        new SendEmailCommand({
          FromEmailAddress: fromEmail,
          Destination: { ToAddresses: toEmails },
          ReplyToAddresses: [data.email],
          Content: {
            Simple: {
              Subject: { Data: `${SERVICE_LABEL[data.service]} · ${data.subject} · ${reference}` },
              Body: {
                Html: { Data: renderEmail(data, reference) },
                Text: { Data: renderText(data, reference) },
              },
            },
          },
        }),
      );
      emailed = true;
    } catch (error) {
      console.error("[gtirides] SES send failed:", error);
    }
  }

  return { ok: true, reference, emailed };
}
