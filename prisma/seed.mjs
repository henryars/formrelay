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

  await prisma.emailDeliveryEvent.deleteMany();
  await prisma.emailSuppression.deleteMany();
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
                defaultRecipientEmails: ["hello@thewebdisciples.com"],
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
                defaultRecipientEmails: ["sales@laundrygrowth.co"],
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

  await prisma.emailLog.createMany({
    data: [
      {
        submissionId: spamSubmission.id,
        recipientEmail: "sales@laundrygrowth.co",
        emailSubject: "Spam submission blocked — Quote Request Form",
        emailStatus: "SKIPPED",
      },
      {
        submissionId: spamSubmission.id,
        recipientEmail: "ops@laundrygrowth.co",
        emailSubject: "Spam submission blocked — Quote Request Form",
        emailStatus: "SKIPPED",
      },
    ],
  });

  // ── Extra inbox leads ──────────────────────────────────────────────────
  const inboxLeads = [
    {
      name: "Amara Nwosu",
      email: "amara.nwosu@gmail.com",
      phone: "+2348031122334",
      message: "Hi, I run a logistics startup and we need a modern website with a contact form and quote request page. What's your timeline and pricing?",
      spamStatus: "CLEAN",
      spamScore: 3,
      form: contactForm,
      website: firstWebsite,
      daysAgo: 1,
    },
    {
      name: "Tobi Adeyemi",
      email: "tobiadeyemi@outlook.com",
      phone: "+2349056789012",
      message: "Hello, I saw your portfolio and I'm interested in a redesign of my restaurant website. Can we schedule a call this week?",
      spamStatus: "CLEAN",
      spamScore: 2,
      form: contactForm,
      website: firstWebsite,
      daysAgo: 2,
    },
    {
      name: "Chidi Okonkwo",
      email: "chidi.dev@protonmail.com",
      phone: null,
      message: "Quick question — do you offer maintenance packages after launch? I have a Webflow site that needs some ongoing support.",
      spamStatus: "CLEAN",
      spamScore: 8,
      form: contactForm,
      website: firstWebsite,
      daysAgo: 3,
    },
    {
      name: "Fatima Al-Hassan",
      email: "fatima@ahassan.co",
      phone: "+2347082345671",
      message: "We're a fashion brand looking for e-commerce integration on our existing site. Budget is flexible for the right team.",
      spamStatus: "CLEAN",
      spamScore: 4,
      form: quoteForm,
      website: secondWebsite,
      daysAgo: 4,
    },
    {
      name: "Emeka Eze",
      email: "emeka.eze95@yahoo.com",
      phone: "+2348123456780",
      message: "Please send me a quote for a 5-page business website. I need it up in 3 weeks for a product launch.",
      spamStatus: "CLEAN",
      spamScore: 6,
      form: quoteForm,
      website: secondWebsite,
      daysAgo: 5,
    },
    {
      name: "Blessing Osei",
      email: "blessing.osei@corp.com",
      phone: "+2330201122334",
      message: "We're rebranding and need a full website overhaul — new copy, new design, and SEO optimisation. Can you handle all of that?",
      spamStatus: "SUSPICIOUS",
      spamScore: 42,
      form: contactForm,
      website: firstWebsite,
      daysAgo: 6,
    },
    {
      name: "Kofi Mensah",
      email: "kofi.mensah@kofim.io",
      phone: "+2330541122334",
      message: "Interested in your web development services. I run a small NGO and we need a donation platform built on a tight budget.",
      spamStatus: "CLEAN",
      spamScore: 7,
      form: contactForm,
      website: firstWebsite,
      daysAgo: 7,
    },
    {
      name: "Ngozi Obi",
      email: "ngoziobi@gmail.com",
      phone: "+2348079871234",
      message: "Hello! I loved the work you did for The Web Disciples. I'm a consultant and need a personal brand website with a booking form. Let's talk!",
      spamStatus: "CLEAN",
      spamScore: 1,
      form: contactForm,
      website: firstWebsite,
      daysAgo: 8,
    },
  ];

  for (const lead of inboxLeads) {
    const createdAt = new Date(Date.now() - lead.daysAgo * 24 * 60 * 60 * 1000);
    const sub = await prisma.submission.create({
      data: {
        workspaceId: workspace.id,
        websiteId: lead.website.id,
        formId: lead.form.id,
        status: "NEW",
        spamStatus: lead.spamStatus,
        spamScore: lead.spamScore,
        spamBucket: lead.spamStatus === "CLEAN" ? "INBOX" : "SUSPICIOUS",
        spamCheckedAt: createdAt,
        notificationStatus: "SENT",
        submitterName: lead.name,
        submitterEmail: lead.email,
        submitterPhone: lead.phone,
        messagePreview: lead.message.slice(0, 200),
        rawFields: {
          name: lead.name,
          email: lead.email,
          ...(lead.phone ? { phone: lead.phone } : {}),
          message: lead.message,
        },
        fieldItems: [
          { key: "name", label: "Name", type: "text", value: lead.name },
          { key: "email", label: "Email", type: "email", value: lead.email },
          ...(lead.phone ? [{ key: "phone", label: "Phone", type: "tel", value: lead.phone }] : []),
          { key: "message", label: "Message", type: "textarea", value: lead.message },
        ],
        sourceUrl: `${lead.website.websiteUrl}/contact`,
        pageTitle: "Contact Us",
        originHeader: lead.website.websiteUrl,
        ipHash: hashIpAddress(`10.0.0.${lead.daysAgo}`),
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) demo browser",
        requestFingerprint: `demo-fp-${lead.daysAgo}`,
        payloadHash: `demo-hash-${lead.daysAgo}`,
        createdAt,
      },
    });
    await prisma.emailLog.create({
      data: {
        submissionId: sub.id,
        recipientEmail: lead.website.defaultRecipientEmails[0],
        emailSubject: `New message from ${lead.name} — ${lead.form.formName}`,
        emailStatus: "SENT",
        sesMessageId: `ses_demo_lead_${lead.daysAgo}`,
        sentAt: createdAt,
      },
    });
  }

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
