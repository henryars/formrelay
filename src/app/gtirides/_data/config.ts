/**
 * GTI Rides prototype — central, easy-to-edit configuration.
 *
 * This whole feature lives under `src/app/gtirides/` + `public/gtirides/`.
 * To detach the prototype from the project, delete those two folders.
 * See `src/app/gtirides/REMOVE.md`.
 */

export const BRAND = {
  name: "GTi Rides",
  tagline: "Connecting Dreams",
  // Lead notifications are sent here (comma-separated for multiple).
  // Override with env GTI_NOTIFY_EMAIL.
  // (The "from" address uses the project's verified AWS_SES_FROM_EMAIL.)
  notifyEmailFallback: "richeythommy@gmail.com, md@gtirides.com",
  // GTi Rides WhatsApp number (international format, no +).
  // Used to deep-link an order with a pre-filled message via wa.me.
  whatsappNumber: "2349160008200",
  // Public vanity link (fallback, no pre-fill possible through it).
  whatsappLink: "https://wa.link/nbfx8f",
} as const;

export const CITIES = [
  "Lagos",
  "Abuja",
  "Port Harcourt",
  "Ibadan",
  "Benin City",
  "Enugu",
  "Kano",
  "Uyo",
  "Owerri",
  "Asaba",
  "Other",
] as const;

export type ServiceKind = "car" | "jet" | "cruise";
