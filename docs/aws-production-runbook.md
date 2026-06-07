# FormRelay AWS Production Runbook

This runbook is written so the application code can stay unchanged while AWS is wired around it.
Everything below assumes the repo already contains the production-ready pieces:

- SES submission notifications
- SES password reset emails
- SES bounce and complaint webhook ingestion at `/api/webhooks/ses`
- recipient suppression after SES feedback
- dashboard visibility for blocked events, SES suppressions, and delivery events

## 1. Create production secrets and env vars

Set these values in your production environment:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DBNAME?schema=public"
NEXT_PUBLIC_APP_URL="https://YOUR_DOMAIN"
AWS_REGION="us-east-1"
AWS_SES_FROM_EMAIL="FormRelay <forms@YOUR_DOMAIN>"
AWS_SES_RESET_FROM_EMAIL="FormRelay <forms@YOUR_DOMAIN>"
AWS_SES_CONFIGURATION_SET="formrelay-production"
AWS_SES_WEBHOOK_TOPIC_ARNS="arn:aws:sns:us-east-1:ACCOUNT_ID:formrelay-ses-events"
AWS_SES_WEBHOOK_AUTO_CONFIRM="true"
SESSION_SECRET="GENERATE_A_LONG_RANDOM_SECRET"
```

Notes:

- If the app runs on an AWS instance role, leave `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` unset.
- If you are not using an instance role, provide `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`.
- `NEXT_PUBLIC_APP_URL` must be the final HTTPS domain because password reset links and cookie behavior depend on it.

## 2. AWS SES setup

1. Verify the sending domain or sender address in SES.
2. If SES is still in sandbox, request production access.
3. Create a configuration set named `formrelay-production` or change `AWS_SES_CONFIGURATION_SET` to the one you use.
4. Make sure the verified sender matches `AWS_SES_FROM_EMAIL`.
5. Make sure the reset sender matches `AWS_SES_RESET_FROM_EMAIL` if you use a separate address.

## 3. SNS webhook setup for bounce and complaint handling

1. Create an SNS topic for SES notifications.
2. Subscribe your production webhook URL to that topic:

```text
https://YOUR_DOMAIN/api/webhooks/ses
```

3. In SES, publish at least `Bounce`, `Complaint`, and `Delivery` events to that SNS topic through the configuration set.
4. Put the resulting topic ARN in `AWS_SES_WEBHOOK_TOPIC_ARNS`.
5. Keep `AWS_SES_WEBHOOK_AUTO_CONFIRM=true` unless you want to confirm the SNS subscription manually.

When connected, the app will:

- verify SNS signatures
- confirm subscriptions automatically
- store delivery events
- suppress bounced or complained recipient emails automatically

## 4. Database migration and app boot

Run these during deploy:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run db:seed
npm run build
```

If you are deploying an existing database that was initially created before the later schema additions, run the manual sync file first:

```bash
psql "$DATABASE_URL" -f prisma/manual-sync.sql
```

## 5. Lightsail deployment flow

1. Provision the Lightsail instance or container service.
2. Attach the production domain and configure HTTPS.
3. Add the env vars above to the runtime.
4. Attach an IAM role or access keys with:
   - `ses:SendEmail`
   - `ses:SendRawEmail` if you expand later
5. Give the instance outbound internet access so SNS certificate validation and subscription confirmation can succeed.
6. Start the app with:

```bash
npm run start
```

If you build on the server:

```bash
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start
```

## 6. Post-deploy verification

1. Visit `/api/health`.
2. Sign up or log in.
3. Submit a clean test form.
4. Verify:
   - the submission appears in `/dashboard/submissions`
   - the notification email arrives
   - an `EmailLog` row is created
5. Request a password reset and verify the email arrives.
6. Confirm `/api/webhooks/ses` receives SNS delivery events.
7. Trigger or simulate a bounce/complaint in SES and confirm:
   - a delivery event appears in `/dashboard/security`
   - the recipient is added to the suppression list

## 7. Rollback checklist

If a deployment fails:

1. Restore the previous app release.
2. Keep the database in place unless the failure is migration-related.
3. If the failure is migration-related, restore from your latest database backup before re-running deploy.
4. Re-run the health check and a clean form submission.

## 8. External-only checklist

These are the pieces you must do in AWS or DNS and cannot be done from the repo alone:

1. Verify the SES sender/domain.
2. Move SES out of sandbox if needed.
3. Create the SES configuration set.
4. Create the SNS topic.
5. Point SES event publishing to that SNS topic.
6. Expose the production HTTPS domain.
7. Set the production env vars.
8. Create the production database and backups.
9. Attach the IAM role or credentials.
