# GTi Rides prototype — how to detach

This prototype is intentionally self-contained so it can be removed in one step.

## What it adds

- `src/app/gtirides/` — all routes, components, data and the server action.
- `public/gtirides/` — logo + vehicle/hero images.
- (optional) one env var: `GTI_NOTIFY_EMAIL` — where lead emails are sent.

It does **not** modify any shared files (no edits to `middleware.ts`, root
`layout.tsx`, `globals.css`, env schema, Prisma, etc.). All styles are scoped
under the `.gti` class and brand fonts load at runtime via Google Fonts.

## To remove completely

```bash
rm -rf src/app/gtirides public/gtirides
```

Then delete the optional `GTI_NOTIFY_EMAIL` line from `.env` if you added it.
That's it — the rest of the app is untouched.

## Wiring notes (before presenting)

Edit `src/app/gtirides/_data/config.ts`:

- `whatsappNumber` — set GTi Rides' real WhatsApp number (international, no `+`)
  so the "Continue on WhatsApp" deep-link pre-fills the request details.
- `notifyEmailFallback` — default lead recipient (or set `GTI_NOTIFY_EMAIL`).

Email is sent through the project's existing AWS SES setup
(`AWS_SES_FROM_EMAIL` + AWS credentials). It is **best-effort**: if SES is not
configured or a send fails, the booking still completes and the customer is
handed off to WhatsApp. The "from" address must be a verified SES identity.

Routes: `/gtirides` (cars), `/gtirides/jets`, `/gtirides/cruises`.
