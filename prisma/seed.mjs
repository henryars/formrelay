import { createHash, scryptSync } from "node:crypto";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = "formrelay-demo-salt";
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function hashIpAddress(ipAddress) {
  return createHash("sha256").update(ipAddress).digest("hex");
}

async function main() {
  const email = "demo@formrelay.local";
  const passwordHash = hashPassword("demo12345");

  await prisma.emailLog.deleteMany();
  await prisma.spamFeedback.deleteMany();
  await prisma.spamEvent.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.blockedEvent.deleteMany();
  await prisma.formInbox.deleteMany();
  await prisma.website.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email,
    },
  });

  const user = await prisma.user.create({
    data: {
      fullName: "Demo User",
      email,
      passwordHash,
      workspaces: {
        create: {
          workspaceName: "Demo Agency Workspace",
          websites: {
            create: [
              {
                websiteName: "The Web Disciples",
                websiteUrl: "https://thewebdisciples.com",
                defaultRecipientEmail: "hello@thewebdisciples.com",
                allowedDomains: ["thewebdisciples.com", "www.thewebdisciples.com"],
                timezone: "Africa/Lagos",
                forms: {
                  create: [
                    {
                      formName: "Contact Form",
                      publicFormId: "fm_demo123",
                      endpointUrl: "/f/fm_demo123",
                      recipientEmails: ["hello@thewebdisciples.com"],
                      spamProtectionLevel: "STANDARD",
                      websiteProtectionMode: "STANDARD",
                      formType: "CONTACT",
                      honeypotFieldName: "_hp_demo123",
                      notifyOnLowSuspicious: true,
                    },
                  ],
                },
              },
              {
                websiteName: "Laundry Growth",
                websiteUrl: "https://laundrygrowth.co",
                defaultRecipientEmail: "sales@laundrygrowth.co",
                allowedDomains: ["laundrygrowth.co"],
                timezone: "Africa/Lagos",
                forms: {
                  create: [
                    {
                      formName: "Quote Request Form",
                      publicFormId: "fm_demo456",
                      endpointUrl: "/f/fm_demo456",
                      recipientEmails: ["sales@laundrygrowth.co", "ops@laundrygrowth.co"],
                      spamProtectionLevel: "STRICT",
                      websiteProtectionMode: "STRICT",
                      formType: "QUOTE_REQUEST",
                      honeypotFieldName: "_hp_demo456",
                      notifyOnLowSuspicious: true,
                      notifyOnSuspicious: true,
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
    include: {
      workspaces: {
        include: {
          websites: {
            include: {
              forms: true,
            },
          },
        },
      },
    },
  });

  const workspace = user.workspaces[0];
  const firstWebsite = workspace.websites[0];
  const secondWebsite = workspace.websites[1];
  const contactForm = firstWebsite.forms[0];
  const quoteForm = secondWebsite.forms[0];

  const cleanSubmission = await prisma.submission.create({
    data: {
      workspaceId: workspace.id,
      websiteId: firstWebsite.id,
      formId: contactForm.id,
      status: "NEW",
      spamStatus: "CLEAN",
      spamScore: 5,
      spamBucket: "INBOX",
      spamReasons: [
        {
          code: "VALID_EMAIL",
          label: "A valid email address was detected",
          score: -10,
          severity: "low",
        },
      ],
      spamCheckedAt: new Date(),
      notificationStatus: "SENT",
      submitterName: "John Doe",
      submitterEmail: "john@example.com",
      submitterPhone: "+2348012345678",
      messagePreview: "I need a website for my restaurant and want a project quote.",
      rawFields: {
        full_name: "John Doe",
        email: "john@example.com",
        phone: "+2348012345678",
        message: "I need a website for my restaurant and want a project quote.",
      },
      fieldItems: [
        { key: "full_name", label: "Full Name", type: "text", value: "John Doe" },
        { key: "email", label: "Email", type: "email", value: "john@example.com" },
        { key: "phone", label: "Phone", type: "tel", value: "+2348012345678" },
      ],
      sourceUrl: "https://thewebdisciples.com/contact",
      pageTitle: "Contact Us",
      originHeader: "https://thewebdisciples.com",
      refererHeader: "https://thewebdisciples.com/contact",
      referrer: "https://google.com",
      ipHash: hashIpAddress("192.0.2.25"),
      userAgent: "Mozilla/5.0 demo browser",
      requestFingerprint: "demo-request-fingerprint-clean",
      payloadHash: "demo-payload-clean",
      metadata: {
        contentType: "application/json",
        formName: "Contact Form",
      },
    },
  });

  await prisma.emailLog.create({
    data: {
      submissionId: cleanSubmission.id,
      recipientEmail: "hello@thewebdisciples.com",
      emailSubject: "New submission from Contact Form — The Web Disciples",
      emailStatus: "SENT",
      sesMessageId: "ses_demo_123",
      sentAt: new Date(),
    },
  });

  const spamSubmission = await prisma.submission.create({
    data: {
      workspaceId: workspace.id,
      websiteId: secondWebsite.id,
      formId: quoteForm.id,
      status: "NEW",
      spamStatus: "SPAM",
      spamScore: 80,
      spamBucket: "SPAM",
      spamReasons: [
        {
          code: "HONEYPOT_FILLED",
          label: "Hidden anti-spam field was filled",
          score: 45,
          severity: "high",
        },
        {
          code: "DISPOSABLE_EMAIL",
          label: "The sender used a disposable email domain",
          score: 20,
          severity: "medium",
        },
      ],
      spamCheckedAt: new Date(),
      notificationStatus: "SUPPRESSED_SPAM",
      notificationSuppressedReason: "Spam notifications are suppressed by default.",
      submitterName: "Spam Sender",
      submitterEmail: "promo@mailinator.com",
      messagePreview: "Get crypto backlinks now https://spam.example https://spam2.example",
      rawFields: {
        name: "Spam Sender",
        email: "promo@mailinator.com",
        message: "Get crypto backlinks now https://spam.example https://spam2.example",
        _company_website: "filled bot trap",
      },
      fieldItems: [
        { key: "name", label: "Name", type: "text", value: "Spam Sender" },
        { key: "email", label: "Email", type: "email", value: "promo@mailinator.com" },
      ],
      sourceUrl: "https://laundrygrowth.co/get-a-quote",
      pageTitle: "Get a Quote",
      originHeader: "https://evil.example",
      refererHeader: "https://evil.example/promo",
      referrer: "https://spam.example",
      ipHash: hashIpAddress("192.0.2.44"),
      userAgent: "bot/1.0",
      requestFingerprint: "demo-request-fingerprint-spam",
      payloadHash: "demo-payload-spam",
      metadata: {
        contentType: "application/json",
        formName: "Quote Request Form",
      },
      spamEvents: {
        create: [
          { reason: "Honeypot field was filled", scoreAdded: 30 },
          { reason: "Known spam keywords detected", scoreAdded: 20 },
          { reason: "Disposable email domain detected", scoreAdded: 10 },
          { reason: "Suspicious or missing user agent", scoreAdded: 15 },
        ],
      },
    },
  });

  await prisma.emailLog.create({
    data: {
      submissionId: spamSubmission.id,
      recipientEmail: "sales@laundrygrowth.co, ops@laundrygrowth.co",
      emailSubject: "Spam submission blocked — Quote Request Form",
      emailStatus: "SKIPPED",
    },
  });

  console.log("Seed complete.");
  console.log("Demo login: demo@formrelay.local / demo12345");
  console.log("Demo endpoint 1: http://localhost:3000/f/fm_demo123");
  console.log("Demo endpoint 2: http://localhost:3000/f/fm_demo456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
