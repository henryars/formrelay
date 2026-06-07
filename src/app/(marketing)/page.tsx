import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  Globe,
  Inbox,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";

const builders = ["Webflow", "Framer", "Lovable", "Replit", "ChatGPT", "React", "Next.js", "Plain HTML"];

const steps = [
  {
    number: "01",
    title: "Add your website",
    body: "Register your domain, set a recipient email, and configure spam protection level. Takes 60 seconds.",
  },
  {
    number: "02",
    title: "Create a form inbox",
    body: "Give your form a name. FormRelay generates a unique public endpoint URL instantly.",
  },
  {
    number: "03",
    title: "Connect and go live",
    body: "Point your HTML form's action attribute at the endpoint — or paste the AI prompt into Lovable, ChatGPT, or Replit.",
  },
];

const features = [
  {
    icon: Database,
    title: "Universal endpoint",
    body: "Any form, any stack. Point your form's action at the endpoint and submissions start flowing — no server required.",
    accent: "bg-[#cfeafa]",
  },
  {
    icon: ShieldCheck,
    title: "Built-in spam protection",
    body: "Honeypots, content scoring, IP hashing, and load-time checks keep your inbox clean without blocking real leads.",
    accent: "bg-[#f6d2f4]",
  },
  {
    icon: Mail,
    title: "Instant email alerts",
    body: "Every clean submission triggers a formatted email via AWS SES, with Reply-To set to the submitter for fast follow-up.",
    accent: "bg-[#e1e0fc]",
  },
  {
    icon: Inbox,
    title: "Submission inbox",
    body: "Every lead is stored, searchable, and visible in a dashboard — even if the email bounced or got missed.",
    accent: "bg-[#d1fae5]",
  },
  {
    icon: Globe,
    title: "Multi-site management",
    body: "One account for all your websites and clients. Route different forms to different team inboxes.",
    accent: "bg-[#fef3c7]",
  },
  {
    icon: Sparkles,
    title: "AI builder prompt",
    body: "Get a one-click copyable prompt to wire up forms in Lovable, Replit, ChatGPT, or any AI website builder.",
    accent: "bg-[#cfeafa]",
  },
];

const testimonials = [
  {
    quote:
      "We switched from a custom backend to FormRelay across 14 client websites. Setup took an afternoon. The spam protection alone was worth it.",
    name: "James K.",
    role: "Director, Studio Keller",
    stars: 5,
  },
  {
    quote:
      "I build everything in Lovable. FormRelay is the one missing piece that makes contact forms actually work. Paste the endpoint, done.",
    name: "Sarah M.",
    role: "Independent Product Designer",
    stars: 5,
  },
  {
    quote:
      "500+ spam submissions a week were making our inbox unusable. FormRelay's filtering got that down to single digits. Game changer.",
    name: "Marco T.",
    role: "Founder, Codeshift",
    stars: 5,
  },
];

const plans = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "forever",
    description: "For one website that just needs working submissions.",
    features: ["1 website", "2 form inboxes", "250 clean submissions/mo", "Basic spam filtering"],
    cta: "Get started free",
    ctaHref: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    priceNote: "/ month",
    description: "For freelancers running multiple client campaigns.",
    features: ["10 websites", "Unlimited forms", "2,500 clean submissions/mo", "Priority email delivery"],
    cta: "Start Pro",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$99",
    priceNote: "/ month",
    description: "For agencies managing many client sites from one account.",
    features: ["Unlimited websites", "Unlimited forms", "10,000 clean submissions/mo", "Agency reporting"],
    cta: "Start Agency",
    ctaHref: "/signup",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden px-6 pb-20 pt-12 md:px-8 md:pt-20 md:pb-28">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-32 -top-10 h-[500px] w-[500px] rounded-full bg-[#e1e0fc]/40 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-[#cfeafa]/50 blur-[100px]" />

        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#0098f2]/20 bg-[#0098f2]/5 px-4 py-1.5 text-sm font-medium text-[#0098f2] mb-6">
            <Zap className="h-3.5 w-3.5" />
            Works with every website builder
          </div>

          <h1 className="max-w-4xl text-balance text-[2.8rem] font-semibold leading-[1.08] tracking-[-0.04em] text-midnight-ink md:text-[4rem] lg:text-[5rem]">
            Make any website form work — without a backend.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[#52525b] md:text-xl">
            FormRelay gives static websites, Webflow builds, and AI-generated landing pages a proper
            submission endpoint, spam protection, and email alerts. No server. No config. Just results.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
            <Link href="/signup" className="button-primary text-base px-7 py-3.5">
              Start free — no credit card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#how-it-works" className="button-secondary text-base px-7 py-3.5">
              See how it works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#71717a]">
            {["Free plan available", "Setup in under 2 minutes", "Spam does not count against your limit"].map(
              (item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-[#0098f2]" />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>

          {/* Hero UI card */}
          <div className="mt-16 w-full max-w-4xl rounded-[28px] bg-white p-4 shadow-[0_8px_60px_rgba(0,0,0,0.1)] border border-[#e8e8e8] md:p-6">
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              {/* Left: form inbox card */}
              <div className="rounded-[20px] bg-[#f7fafc] p-5 text-left">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-[#8d8d8d] uppercase tracking-widest">Contact Form</p>
                    <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#0f0f0f]">
                      Endpoint ready
                    </h2>
                  </div>
                  <span className="rounded-full bg-white border border-[#e4e4e7] px-3 py-1 text-xs font-medium text-[#0098f2]">
                    Active
                  </span>
                </div>
                <div className="mt-4 rounded-[16px] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#f0f0f0]">
                  <p className="text-xs text-[#8d8d8d]">Endpoint URL</p>
                  <p className="mt-1.5 text-xs font-mono font-medium text-[#0f0f0f] break-all">
                    https://formrelay.app/f/fm_abc123
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#cfeafa]/60 p-3">
                      <p className="text-[11px] text-[#8d8d8d]">Recipient</p>
                      <p className="mt-1 text-xs font-medium text-[#0f0f0f]">hello@studio.com</p>
                    </div>
                    <div className="rounded-xl bg-[#f6d2f4]/60 p-3">
                      <p className="text-[11px] text-[#8d8d8d]">Spam score</p>
                      <p className="mt-1 text-xs font-medium text-[#0f0f0f]">Clean ✓</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-[16px] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#f0f0f0]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-[#0f0f0f]">Today&apos;s submissions</p>
                    <span className="rounded-full bg-[#0098f2]/10 px-2 py-0.5 text-xs font-medium text-[#0098f2]">4 new</span>
                  </div>
                  {[
                    { name: "John Doe", email: "john@example.com", status: "Clean" },
                    { name: "Sarah Lee", email: "sarah@company.com", status: "Clean" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-1.5 border-b border-[#f4f4f5] last:border-0">
                      <div>
                        <p className="text-xs font-medium text-[#0f0f0f]">{s.name}</p>
                        <p className="text-[11px] text-[#8d8d8d]">{s.email}</p>
                      </div>
                      <span className="text-[11px] text-[#16a34a] font-medium">{s.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: email notification card */}
              <div className="rounded-[20px] bg-[#e1e0fc]/30 p-5 text-left">
                <p className="text-xs font-medium text-[#8d8d8d] uppercase tracking-widest">Email alert</p>
                <div className="mt-4 rounded-[16px] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#f0f0f0]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#0f0f0f]">New submission</p>
                      <p className="mt-0.5 text-xs text-[#8d8d8d]">Contact Form · The Web Disciples</p>
                    </div>
                    <span className="rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-1 text-[11px] font-medium text-[#16a34a] shrink-0">
                      Delivered
                    </span>
                  </div>
                  <div className="mt-4 space-y-2.5">
                    {[
                      { label: "From", value: "John Doe" },
                      { label: "Email", value: "john@example.com" },
                      { label: "Message", value: "I need a quote for my restaurant website..." },
                    ].map((row) => (
                      <div key={row.label}>
                        <p className="text-[11px] text-[#8d8d8d]">{row.label}</p>
                        <p className="text-xs font-medium text-[#0f0f0f] mt-0.5">{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#f4f4f5]">
                    <p className="text-[11px] text-[#0098f2] font-medium">Reply directly from your inbox →</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[16px] bg-white p-4 shadow-[0_1px_4px_rgba(0,0,0,0.06)] border border-[#f0f0f0]">
                  <p className="text-xs font-medium text-[#0f0f0f] mb-2">Spam blocked this week</p>
                  <div className="flex items-end gap-1 h-12">
                    {[3, 6, 4, 8, 5, 11, 7].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-[#fca5a5]"
                        style={{ height: `${(h / 11) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#8d8d8d] mt-2">44 blocked · 0 in your inbox</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Builders bar */}
      <section className="border-y border-[#ebebeb] bg-white px-6 py-5 md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-8 gap-y-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-[#a1a1aa] whitespace-nowrap">
            Works with
          </p>
          {builders.map((b) => (
            <span key={b} className="text-sm font-semibold text-[#71717a]">
              {b}
            </span>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-medium text-[#0098f2] mb-3">How it works</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
              From zero to live in three steps.
            </h2>
            <p className="mt-4 text-lg text-[#71717a]">
              No backend. No server config. No DevOps.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative rounded-[20px] bg-white p-7 shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-[#f0f0f0]"
              >
                <span className="text-4xl font-bold text-[#0098f2]/15 tracking-tight">{step.number}</span>
                <h3 className="mt-4 text-xl font-semibold text-midnight-ink">{step.title}</h3>
                <p className="mt-3 text-[#71717a] leading-7">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-[#f7fafc] border-y border-[#ebebeb] px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-medium text-[#0098f2] mb-3">Core features</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
              Everything your forms need. Nothing they don&apos;t.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-[20px] bg-white p-6 shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-[#f0f0f0]"
                >
                  <div className={`inline-flex rounded-xl p-2.5 ${feature.accent}`}>
                    <Icon className="h-5 w-5 text-[#0f0f0f]" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-midnight-ink">{feature.title}</h3>
                  <p className="mt-2.5 text-[#71717a] leading-7 text-sm">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-medium text-[#0098f2] mb-3">What people say</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
              Built for people who ship websites.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-5 rounded-[20px] bg-white p-7 shadow-[0_1px_8px_rgba(0,0,0,0.06)] border border-[#f0f0f0]"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>
                <p className="flex-1 text-[#52525b] leading-7">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-midnight-ink">{t.name}</p>
                  <p className="text-sm text-[#8d8d8d]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="bg-[#f7fafc] border-y border-[#ebebeb] px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-medium text-[#0098f2] mb-3">Simple pricing</p>
            <h2 className="text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
              Spam never counts against your limit.
            </h2>
            <p className="mt-4 text-lg text-[#71717a]">
              Start free. Upgrade when you grow.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[20px] p-7 ${
                  plan.highlighted
                    ? "bg-[#0d111b] text-white shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
                    : "bg-white border border-[#f0f0f0] shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
                }`}
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0098f2] px-4 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <p className={`text-sm font-medium ${plan.highlighted ? "text-[#0098f2]" : "text-[#0098f2]"}`}>
                  {plan.name}
                </p>
                <div className="mt-4 flex items-end gap-1">
                  <span className={`text-4xl font-bold tracking-tight ${plan.highlighted ? "text-white" : "text-midnight-ink"}`}>
                    {plan.price}
                  </span>
                  <span className={`mb-1.5 text-sm ${plan.highlighted ? "text-white/50" : "text-[#8d8d8d]"}`}>
                    {plan.priceNote}
                  </span>
                </div>
                <p className={`mt-3 text-sm leading-6 ${plan.highlighted ? "text-white/60" : "text-[#71717a]"}`}>
                  {plan.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-[#0098f2]" : "text-[#16a34a]"}`} />
                      <span className={plan.highlighted ? "text-white/80" : "text-[#52525b]"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full py-2.5 text-sm font-medium transition-colors ${
                    plan.highlighted
                      ? "bg-[#0098f2] text-white hover:bg-[#007dd1]"
                      : "bg-[#f4f4f5] text-[#0f0f0f] hover:bg-[#e4e4e7]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-[#8d8d8d]">
            <Link href="/pricing" className="text-[#0098f2] hover:underline font-medium">
              View full pricing and feature comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[28px] bg-[#0d111b] px-8 py-16 text-center md:px-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Stop losing contact form submissions.
            </h2>
            <p className="mt-4 text-lg text-white/60 max-w-xl mx-auto">
              FormRelay gives any website a real form backend — with spam protection, email alerts, and a
              full submissions dashboard.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#0098f2] px-7 py-3.5 text-base font-medium text-white hover:bg-[#007dd1] transition-colors">
                Get started free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-base font-medium text-white hover:bg-white/10 transition-colors">
                View pricing
              </Link>
            </div>
            <p className="mt-5 text-sm text-white/30">No credit card required · Free plan available</p>
          </div>
        </div>
      </section>
    </main>
  );
}
