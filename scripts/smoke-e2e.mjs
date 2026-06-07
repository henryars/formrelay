import { createHmac } from "node:crypto";
import assert from "node:assert/strict";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const sessionSecret = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";

function makeSessionCookie(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(encodedPayload).digest("base64url");
  return `formrelay_session=${encodedPayload}.${signature}`;
}

async function expectStatus(response, expected, label) {
  assert.equal(response.status, expected, `${label} expected ${expected} but got ${response.status}`);
}

async function main() {
  const demoUser = await prisma.user.findUnique({
    where: {
      email: "demo@formrelay.local",
    },
    include: {
      workspaces: {
        orderBy: {
          createdAt: "asc",
        },
        include: {
          websites: {
            orderBy: {
              createdAt: "asc",
            },
            include: {
              forms: {
                orderBy: {
                  createdAt: "asc",
                },
              },
            },
          },
        },
      },
    },
  });

  assert.ok(demoUser, "Demo user must exist. Run npm run db:seed first.");

  const cookie = makeSessionCookie({
    userId: demoUser.id,
    email: demoUser.email,
    issuedAt: Date.now(),
  });

  const health = await fetch(`${baseUrl}/api/health`);
  await expectStatus(health, 200, "Health check");

  const anonymousDashboard = await fetch(`${baseUrl}/dashboard`, {
    redirect: "manual",
  });
  assert.ok(
    anonymousDashboard.status === 307 || anonymousDashboard.status === 308,
    `Anonymous dashboard should redirect, got ${anonymousDashboard.status}`,
  );

  const protectedPages = [
    "/dashboard",
    "/dashboard/onboarding",
    "/dashboard/websites",
    "/dashboard/forms",
    "/dashboard/submissions",
    "/dashboard/spam",
    "/dashboard/security",
    "/dashboard/settings",
    "/dashboard/billing",
  ];

  for (const path of protectedPages) {
    const response = await fetch(`${baseUrl}${path}`, {
      headers: {
        cookie,
      },
    });
    await expectStatus(response, 200, `Protected page ${path}`);
  }

  const website = demoUser.workspaces[0]?.websites[0];
  const strictWebsite = demoUser.workspaces[0]?.websites[1];
  assert.ok(website?.forms[0], "Seeded contact form missing");
  assert.ok(strictWebsite?.forms[0], "Seeded quote form missing");

  const uniqueEmail = `jane+${Date.now()}@example.com`;
  const submissionResponse = await fetch(`${baseUrl}/f/${website.forms[0].publicFormId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        full_name: "Jane E2E",
        email: uniqueEmail,
        phone: "+2348099999999",
        message: "Testing end to end submission flow",
      },
      source_url: website.websiteUrl,
      page_title: "Contact",
      form_name: website.forms[0].formName,
    }),
  });
  await expectStatus(submissionResponse, 200, "Clean submission");
  const submissionPayload = await submissionResponse.json();
  assert.equal(submissionPayload.success, true, "Clean submission should succeed");

  const createdSubmission = await prisma.submission.findFirst({
    where: {
      formId: website.forms[0].id,
      submitterEmail: uniqueEmail,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  assert.ok(createdSubmission, "Created submission should exist in the database");

  const duplicateResponse = await fetch(`${baseUrl}/f/${website.forms[0].publicFormId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        full_name: "Jane E2E",
        email: uniqueEmail,
        phone: "+2348099999999",
        message: "Testing end to end submission flow",
      },
      source_url: website.websiteUrl,
      page_title: "Contact",
      form_name: website.forms[0].formName,
    }),
  });
  await expectStatus(duplicateResponse, 200, "Duplicate submission still stored");
  const duplicateStored = await prisma.submission.findFirst({
    where: {
      formId: website.forms[0].id,
      submitterEmail: uniqueEmail,
      id: {
        not: createdSubmission.id,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  assert.ok(duplicateStored, "Duplicate submission should still be stored");
  assert.equal(
    duplicateStored.spamStatus,
    "SUSPICIOUS",
    "Fast duplicate submission should be marked suspicious",
  );

  const blockedEmail = `blocked+${Date.now()}@example.com`;
  const mismatchedOrigin = await fetch(`${baseUrl}/f/${website.forms[0].publicFormId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://evil.example",
    },
    body: JSON.stringify({
      fields: {
        name: "Blocked Source",
        email: blockedEmail,
        message: "This should still store so we do not lose a real lead.",
      },
      source_url: "https://evil.example/contact",
      page_title: "Blocked",
    }),
  });
  await expectStatus(mismatchedOrigin, 200, "Mismatched origin submission");
  const mismatchedOriginSubmission = await prisma.submission.findFirst({
    where: {
      formId: website.forms[0].id,
      submitterEmail: blockedEmail,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  assert.ok(
    mismatchedOriginSubmission,
    "Mismatched-origin submission should still be stored for review",
  );

  const spamEmail = `promo+${Date.now()}@mailinator.com`;
  const spamResponse = await fetch(`${baseUrl}/f/${strictWebsite.forms[0].publicFormId}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        email: spamEmail,
        message: "crypto backlinks https://one.example https://two.example https://three.example",
        _company_website: "filled bot trap",
      },
      source_url: strictWebsite.websiteUrl,
      page_title: "Quote Request",
      form_name: strictWebsite.forms[0].formName,
    }),
  });
  await expectStatus(spamResponse, 200, "Spam submission still stores successfully");
  const spamPayload = await spamResponse.json();
  assert.equal(spamPayload.success, true, "Spam submission should still look successful");
  const spamSubmission = await prisma.submission.findFirst({
    where: {
      formId: strictWebsite.forms[0].id,
      submitterEmail: spamEmail,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  assert.equal(spamSubmission?.spamStatus, "SPAM", "Spam submission should be classified as SPAM");

  const exportResponse = await fetch(`${baseUrl}/dashboard/submissions/export`, {
    headers: {
      cookie,
    },
  });
  await expectStatus(exportResponse, 200, "CSV export");
  const csv = await exportResponse.text();
  assert.ok(csv.includes("status,spam_status"), "CSV header missing");

  const submissionDetail = await fetch(`${baseUrl}/dashboard/submissions/${createdSubmission.id}`, {
    headers: {
      cookie,
    },
  });
  await expectStatus(submissionDetail, 200, "Submission detail page");

  const spamPage = await fetch(`${baseUrl}/dashboard/spam`, {
    headers: {
      cookie,
    },
  });
  await expectStatus(spamPage, 200, "Spam listing page");

  console.log("Smoke E2E checks passed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
