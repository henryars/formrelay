import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Inbox,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Zap,
  Database,
} from "lucide-react";

const builders = ["Lovable", "Webflow", "Framer", "ChatGPT", "Replit", "React", "Next.js", "Plain HTML"];

const steps = [
  {
    icon: Globe,
    title: "Add your website",
    body: "Tell us your site's name and the email where you want to receive messages. Takes about 30 seconds.",
  },
  {
    icon: Database,
    title: "Create a form",
    body: "Give your form a name. We instantly generate a unique address for it — no coding needed.",
  },
  {
    icon: Zap,
    title: "Copy and paste",
    body: "Drop our snippet into your site, or paste a one-click prompt into Lovable, ChatGPT, or any AI builder.",
  },
];

const features = [
  {
    icon: Globe,
    title: "Works on any website",
    body: "Webflow, Framer, Lovable, plain HTML — if it can send a form, FormRelay can receive it. No server required.",
    accent: "bg-[#dbeafe]",
  },
  {
    icon: ShieldCheck,
    title: "Spam stays out of your inbox",
    body: "Smart filters block bots and junk automatically. You only see real messages from real people.",
    accent: "bg-[#fce7f3]",
  },
  {
    icon: Mail,
    title: "Get an email for every message",
    body: "The moment someone submits your form, you get a clean email alert with all their details and a reply link.",
    accent: "bg-[#ede9fe]",
  },
  {
    icon: Inbox,
    title: "Never lose a lead",
    body: "Every submission is saved in your dashboard — even if the email notification gets missed.",
    accent: "bg-[#d1fae5]",
  },
  {
    icon: Globe,
    title: "Manage every site from one place",
    body: "One account for all your websites and clients. Different forms, different inboxes, one dashboard.",
    accent: "bg-[#fef3c7]",
  },
  {
    icon: Sparkles,
    title: "One-click setup for AI builders",
    body: "Get a ready-made prompt to paste into Lovable, Replit, or ChatGPT. It wires up your form automatically.",
    accent: "bg-[#dbeafe]",
  },
];

const testimonials = [
  {
    quote:
      "We switched 14 client websites to FormRelay in one afternoon. The spam protection alone made it worth it — we went from hundreds of junk messages a day to almost none.",
    name: "James K.",
    role: "Director, Studio Keller",
    stars: 5,
  },
  {
    quote:
      "I build everything in Lovable. FormRelay is the missing piece that makes contact forms actually work. Paste the address, done. Five minutes total.",
    name: "Sarah M.",
    role: "Independent Product Designer",
    stars: 5,
  },
  {
    quote:
      "500+ spam messages a week were making our inbox unusable. FormRelay's filtering got that down to almost nothing. Now I actually look forward to checking my form inbox.",
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
    description: "One website that just needs a working contact form.",
    features: ["1 website", "2 forms", "250 real messages/month", "Basic spam filtering"],
    cta: "Start for free",
    ctaHref: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    priceNote: "/ month",
    description: "For freelancers managing multiple client websites.",
    features: ["10 websites", "Unlimited forms", "2,500 real messages/month", "Priority email delivery"],
    cta: "Start Pro",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$99",
    priceNote: "/ month",
    description: "For agencies managing lots of client sites from one account.",
    features: ["Unlimited websites", "Unlimited forms", "10,000 real messages/month", "Agency reporting"],
    cta: "Start Agency",
    ctaHref: "/signup",
    highlighted: false,
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-5 pb-20 pt-14 md:px-8 md:pt-24 md:pb-32">
        <div className="pointer-events-none absolute -left-40 -top-20 h-[600px] w-[600px] rounded-full bg-[#dbeafe]/40 blur-[140px]" />
        <div className="pointer-events-none absolute -right-40 top-10 h-[500px] w-[500px] rounded-full bg-[#ede9fe]/40 blur-[120px]" />

        <div className="relative mx-auto flex w-full max-w-[1200px] flex-col items-center text-center gap-8">
          <h1
            className="max-w-3xl text-balance font-bold leading-[1.08] tracking-[-0.04em] text-[#09090b]"
            style={{ fontSize: "clamp(2.4rem, 5vw, 4rem)" }}
          >
            Your contact form,{" "}
            <span className="text-[#a1a1aa]">finally working.</span>
          </h1>

          <p className="max-w-xl text-lg leading-[1.65] text-[#71717a] md:text-xl">
            Build your site in Lovable, Webflow, or ChatGPT. Add your form in 60 seconds.
            Get every message — no missed leads, no spam.
          </p>

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#09090b] px-7 py-3.5 text-base font-medium"
              style={{
                color: "#ffffff",
                boxShadow:
                  "rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px",
              }}
            >
              Start free — no credit card
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-white px-7 py-3.5 text-base font-medium text-[#3f3f46] hover:bg-[#f4f4f5] transition-colors"
            >
              See how it works
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[#71717a]">
            {[
              "Free plan available",
              "Setup in under 2 minutes",
              "Spam never counts against your limit",
            ].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Hero product card */}
          <div
            className="mt-8 w-full max-w-4xl rounded-[36px] bg-white p-5 md:p-7 border border-[#ececee]"
            style={{ boxShadow: "rgba(0,0,0,0.08) 0px 12px 48px 0px" }}
          >
            <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-[24px] bg-[#f4f4f5] p-5 text-left">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Contact Form</p>
                    <h2 className="mt-1 text-lg font-bold text-[#09090b]">Form address ready</h2>
                  </div>
                  <span className="rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 text-xs font-semibold text-[#16a34a]">
                    Active
                  </span>
                </div>
                <div className="rounded-[16px] bg-white p-4 border border-[#ececee]">
                  <p className="text-[11px] font-medium text-[#a1a1aa] uppercase tracking-widest">Form address</p>
                  <p className="mt-1.5 font-mono text-xs font-semibold text-[#09090b] break-all">
                    formrelay.app/f/fm_abc123
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-[12px] bg-[#dbeafe]/60 p-3">
                      <p className="text-[11px] text-[#71717a]">Send to</p>
                      <p className="mt-1 text-xs font-semibold text-[#09090b]">hello@studio.com</p>
                    </div>
                    <div className="rounded-[12px] bg-[#d1fae5]/60 p-3">
                      <p className="text-[11px] text-[#71717a]">Spam check</p>
                      <p className="mt-1 text-xs font-semibold text-[#16a34a]">Good ✓</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 rounded-[16px] bg-white p-4 border border-[#ececee]">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-[#09090b]">Today&apos;s messages</p>
                    <span className="rounded-full bg-[#dbeafe] px-2 py-0.5 text-xs font-semibold text-[#0098f2]">
                      4 new
                    </span>
                  </div>
                  {[
                    { name: "John Doe", email: "john@example.com" },
                    { name: "Sarah Lee", email: "sarah@company.com" },
                  ].map((s) => (
                    <div key={s.name} className="flex items-center justify-between py-2 border-b border-[#f4f4f5] last:border-0">
                      <div>
                        <p className="text-xs font-semibold text-[#09090b]">{s.name}</p>
                        <p className="text-[11px] text-[#a1a1aa]">{s.email}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-[#16a34a]">Good</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] bg-[#ede9fe]/30 p-5 text-left">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Email alert</p>
                <div className="mt-4 rounded-[16px] bg-white p-4 border border-[#ececee]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-[#09090b]">New message</p>
                      <p className="mt-0.5 text-xs text-[#a1a1aa]">Contact Form · The Studio</p>
                    </div>
                    <span className="rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 text-[11px] font-semibold text-[#16a34a] shrink-0">
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
                        <p className="text-[11px] text-[#a1a1aa]">{row.label}</p>
                        <p className="text-xs font-semibold text-[#09090b] mt-0.5">{row.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#f4f4f5]">
                    <p className="text-[11px] font-semibold text-[#0098f2]">Reply directly from your inbox →</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[16px] bg-white p-4 border border-[#ececee]">
                  <p className="text-xs font-semibold text-[#09090b] mb-2">Spam blocked this week</p>
                  <div className="flex items-end gap-1 h-10">
                    {[3, 6, 4, 8, 5, 11, 7].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-[#fca5a5]"
                        style={{ height: `${(h / 11) * 100}%` }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#a1a1aa] mt-2">44 blocked · 0 in your inbox</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Logo cloud ── */}
      <section className="border-y border-[#ececee] bg-white px-5 py-10 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#a1a1aa] mb-8">
            Works with every tool you already use
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-6">
            {[
              { name: "Lovable",    logo: "https://lovable.dev/img/logo/logowhite.svg",                                                              bg: "#FF3B6B",  invert: false },
              { name: "Webflow",   logo: "https://cdn.simpleicons.org/webflow/146EF5",                                                               bg: "none",     invert: false },
              { name: "Framer",    logo: "https://cdn.simpleicons.org/framer/000000",                                                                bg: "none",     invert: false },
              { name: "ChatGPT",   logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/960px-ChatGPT-Logo.svg.png",    bg: "none",     invert: false },
              { name: "Replit",    logo: "https://cdn.simpleicons.org/replit/F26207",                                                                bg: "none",     invert: false },
              { name: "WordPress", logo: "https://cdn.simpleicons.org/wordpress/21759B",                                                             bg: "none",     invert: false },
              { name: "Next.js",   logo: "https://cdn.simpleicons.org/nextdotjs/000000",                                                             bg: "none",     invert: false },
              { name: "React",     logo: "https://cdn.simpleicons.org/react/61DAFB",                                                                 bg: "none",     invert: false },
              { name: "Wix",       logo: "https://cdn.simpleicons.org/wix/000000",                                                                   bg: "none",     invert: false },
              { name: "Squarespace", logo: "https://cdn.simpleicons.org/squarespace/000000",                                                         bg: "none",     invert: false },
              { name: "Bolt",      logo: "https://cdn.jsdelivr.net/gh/callback-io/allogo@main/public/logos/bolt/icon.svg",                          bg: "#09090b",  invert: false },
              { name: "Vue",       logo: "https://cdn.simpleicons.org/vuedotjs/4FC08D",                                                              bg: "none",     invert: false },
            ].map(({ name, logo, bg, invert }) => (
              <div key={name} className="flex flex-col items-center gap-2">
                <div
                  className="h-10 w-10 rounded-[10px] flex items-center justify-center overflow-hidden"
                  style={{ background: bg === "none" ? "transparent" : bg }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logo}
                    alt={name}
                    width={28}
                    height={28}
                    style={{ objectFit: "contain", filter: invert ? "invert(1)" : "none" }}
                  />
                </div>
                <span className="text-[11px] font-medium" style={{ color: "#a1a1aa" }}>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="px-5 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-[#0098f2] mb-3">How it works</p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#09090b]">
              From zero to working form in minutes.
            </h2>
            <p className="mt-4 text-lg text-[#71717a]">No code, no server, no DevOps.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-[28px] bg-white p-7 border border-[#ececee]"
                  style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
                >
                  <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#f4f4f5]">
                    <Icon className="h-5 w-5 text-[#09090b]" />
                  </div>
                  <div className="absolute top-7 right-7 text-3xl font-black text-[#0098f2]/10 tabular-nums">
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  <h3 className="text-lg font-bold text-[#09090b]">{step.title}</h3>
                  <p className="mt-3 text-[#71717a] leading-[1.65] text-sm">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="bg-white border-y border-[#ececee] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-[#0098f2] mb-3">Everything included</p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#09090b]">
              Everything your forms need. Nothing they don&apos;t.
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="rounded-[28px] bg-white p-6 border border-[#ececee]"
                  style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
                >
                  <div className={`inline-flex rounded-[14px] p-2.5 ${feature.accent}`}>
                    <Icon className="h-5 w-5 text-[#09090b]" />
                  </div>
                  <h3 className="mt-5 text-base font-bold text-[#09090b]">{feature.title}</h3>
                  <p className="mt-2 text-[#71717a] leading-[1.65] text-sm">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-5 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-[#0098f2] mb-3">What people say</p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#09090b]">
              Built for people who ship websites.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-5 rounded-[28px] bg-white p-7 border border-[#ececee]"
                style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                  ))}
                </div>
                <p className="flex-1 text-[#52525b] leading-[1.65] text-sm">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-bold text-[#09090b]">{t.name}</p>
                  <p className="text-sm text-[#a1a1aa]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ── */}
      <section className="bg-white border-y border-[#ececee] px-5 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-sm font-semibold text-[#0098f2] mb-3">Simple pricing</p>
            <h2 className="text-4xl font-bold tracking-[-0.03em] text-[#09090b]">
              Spam never counts against your limit.
            </h2>
            <p className="mt-4 text-lg text-[#71717a]">Start free. Upgrade when you grow.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3 max-w-4xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[28px] p-7 ${
                  plan.highlighted ? "bg-[#09090b] text-white" : "bg-white border border-[#ececee]"
                }`}
                style={
                  plan.highlighted
                    ? { boxShadow: "rgba(0,0,0,0.20) 0px 12px 48px 0px" }
                    : { boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }
                }
              >
                {plan.highlighted && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#0098f2] px-4 py-1 text-xs font-bold text-white">
                    Most popular
                  </span>
                )}
                <p className="text-sm font-semibold text-[#0098f2]">{plan.name}</p>
                <div className="mt-4 flex items-end gap-1">
                  <span
                    className="text-4xl font-black tracking-tight"
                    style={{ color: plan.highlighted ? "#ffffff" : "#09090b" }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="mb-1.5 text-sm"
                    style={{ color: plan.highlighted ? "rgba(255,255,255,0.55)" : "#a1a1aa" }}
                  >
                    {plan.priceNote}
                  </span>
                </div>
                <p
                  className="mt-3 text-sm leading-[1.6]"
                  style={{ color: plan.highlighted ? "rgba(255,255,255,0.65)" : "#71717a" }}
                >
                  {plan.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlighted ? "text-[#0098f2]" : "text-[#16a34a]"}`} />
                      <span style={{ color: plan.highlighted ? "rgba(255,255,255,0.85)" : "#52525b" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.ctaHref}
                  className={`mt-8 inline-flex w-full items-center justify-center rounded-full py-2.5 text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-[#0098f2] text-white hover:bg-[#007dd1]"
                      : "bg-[#f4f4f5] text-[#09090b] hover:bg-[#ececee]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-8 text-sm text-[#a1a1aa]">
            <Link href="/pricing" className="text-[#0098f2] hover:underline font-medium">
              View full pricing and feature comparison →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[36px] bg-[#09090b] px-8 py-16 text-center md:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Stop losing messages from your website.
            </h2>
            <p className="mt-4 text-lg max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.65)" }}>
              Set up takes under 2 minutes. No server needed. No tech skills required.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-base font-semibold hover:bg-[#f4f4f5] transition-colors"
                style={{ color: "#09090b" }}
              >
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-base font-medium transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.25)", color: "#ffffff" }}
              >
                View pricing
              </Link>
            </div>
            <p className="mt-5 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>No credit card required · Free plan available</p>
          </div>
        </div>
      </section>
    </main>
  );
}
