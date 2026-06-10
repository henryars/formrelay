import Link from "next/link";
import { ArrowRight, CheckCircle2, X } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "Free",
    priceNote: "forever",
    description: "For a single website that just needs working form submissions.",
    features: [
      "1 website",
      "2 form inboxes",
      "250 clean submissions / mo",
      "Basic spam filtering",
      "Email notifications",
      "Submission dashboard",
    ],
    missing: ["Multiple websites", "Priority delivery", "Agency reporting"],
    cta: "Get started free",
    ctaHref: "/signup",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    priceNote: "/ month",
    description: "For freelancers and product teams managing multiple websites.",
    features: [
      "10 websites",
      "Unlimited form inboxes",
      "2,500 clean submissions / mo",
      "Advanced spam protection",
      "Priority email delivery",
      "Field mapping",
      "Lead status tracking",
      "Weekly spam summary",
    ],
    missing: ["Agency reporting", "Unlimited websites"],
    cta: "Start Pro",
    ctaHref: "/signup",
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$99",
    priceNote: "/ month",
    description: "For agencies managing many client websites from one account.",
    features: [
      "Unlimited websites",
      "Unlimited form inboxes",
      "10,000 clean submissions / mo",
      "Advanced spam protection",
      "Priority email delivery",
      "Field mapping",
      "Lead status tracking",
      "Weekly spam summary",
      "Agency reporting",
    ],
    missing: [],
    cta: "Start Agency",
    ctaHref: "/signup",
    highlighted: false,
  },
];

const comparison = [
  { feature: "Websites", starter: "1", pro: "10", agency: "Unlimited" },
  { feature: "Form inboxes", starter: "2", pro: "Unlimited", agency: "Unlimited" },
  { feature: "Clean submissions / mo", starter: "250", pro: "2,500", agency: "10,000" },
  { feature: "Spam filtering", starter: "Basic", pro: "Advanced", agency: "Advanced" },
  { feature: "Email notifications", starter: true, pro: true, agency: true },
  { feature: "Submission dashboard", starter: true, pro: true, agency: true },
  { feature: "Field mapping", starter: false, pro: true, agency: true },
  { feature: "Lead status tracking", starter: false, pro: true, agency: true },
  { feature: "Priority email delivery", starter: false, pro: true, agency: true },
  { feature: "Weekly spam summary", starter: false, pro: true, agency: true },
  { feature: "Agency reporting", starter: false, pro: false, agency: true },
];

const faqs = [
  {
    q: "Does spam count against my submission limit?",
    a: "No. Only clean submissions that pass spam filtering count. You will never be penalized for traffic you did not invite.",
  },
  {
    q: "Can I use FormRelay with forms that already exist on my site?",
    a: "Yes. All you need to do is point your form's action attribute at your FormRelay endpoint. No changes to the form design or validation required.",
  },
  {
    q: "Does it work with Webflow, Framer, and AI-built sites?",
    a: "Yes — those are our most common use cases. FormRelay also provides a one-click AI prompt you can paste into Lovable, Replit, or ChatGPT to wire up forms automatically.",
  },
  {
    q: "Can I route different forms to different recipient emails?",
    a: "Yes. Each form inbox has its own recipient email list. One website can have multiple inboxes routing to different teams.",
  },
  {
    q: "What happens if I exceed my submission limit?",
    a: "Submissions are never silently dropped. We will notify you when you approach your limit so you can upgrade before anything is missed.",
  },
  {
    q: "Can I cancel at any time?",
    a: "Yes. No contracts, no lock-in. Cancel from your billing settings at any time and you will keep access until the end of your billing period.",
  },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "boolean") {
    return value ? (
      <CheckCircle2 className="h-4 w-4 text-[#16a34a] mx-auto" />
    ) : (
      <X className="h-4 w-4 text-[#d4d4d8] mx-auto" />
    );
  }
  return <span>{value}</span>;
}

export default function PricingPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="px-6 pb-16 pt-14 md:px-8 md:pt-20 text-center">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-sm font-medium text-[#0098f2] mb-3">Simple pricing</p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-midnight-ink md:text-5xl">
            Spam never counts against your limit.
          </h1>
          <p className="mt-5 text-lg text-[#71717a] max-w-xl mx-auto">
            Start free and upgrade when your forms get serious. No hidden fees, no per-submission surprise charges.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="px-6 pb-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-[24px] p-8 ${
                  plan.highlighted
                    ? "bg-[#0d111b] text-white shadow-[0_12px_48px_rgba(0,0,0,0.22)] ring-1 ring-[#0098f2]/30"
                    : "bg-white border border-[#e8e8e8] shadow-[0_1px_8px_rgba(0,0,0,0.06)]"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-[#0098f2] px-4 py-1.5 text-xs font-semibold text-white shadow-sm">
                      Most popular
                    </span>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-[#0098f2]">{plan.name}</p>
                  <div className="mt-4 flex items-end gap-1.5">
                    <span
                      className="text-5xl font-bold tracking-tight"
                      style={{ color: plan.highlighted ? "#ffffff" : "#09090b" }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="mb-2 text-sm font-medium"
                      style={{ color: plan.highlighted ? "rgba(255,255,255,0.5)" : "#a1a1aa" }}
                    >
                      {plan.priceNote}
                    </span>
                  </div>
                  <p
                    className="mt-3 text-sm leading-6"
                    style={{ color: plan.highlighted ? "rgba(255,255,255,0.65)" : "#71717a" }}
                  >
                    {plan.description}
                  </p>
                </div>

                <div className="mt-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-[#0098f2]" : "text-[#16a34a]"}`} />
                      <span style={{ color: plan.highlighted ? "rgba(255,255,255,0.88)" : "#52525b" }}>{f}</span>
                    </div>
                  ))}
                  {plan.missing.map((f) => (
                    <div key={f} className="flex items-start gap-2.5 text-sm">
                      <X className={`h-4 w-4 mt-0.5 shrink-0`} style={{ color: plan.highlighted ? "rgba(255,255,255,0.25)" : "#d4d4d8" }} />
                      <span style={{ color: plan.highlighted ? "rgba(255,255,255,0.35)" : "#a1a1aa" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-[#0098f2] text-white hover:bg-[#007dd1]"
                      : "bg-[#f4f4f5] text-[#0f0f0f] hover:bg-[#e4e4e7]"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center mt-6 text-sm text-[#a1a1aa]">
            All plans include a free 14-day trial of Pro features.
          </p>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="border-t border-[#ebebeb] bg-white px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <h2 className="text-3xl font-semibold tracking-tight text-midnight-ink mb-10 text-center">
            Full feature comparison
          </h2>
          <div className="overflow-x-auto rounded-[20px] border border-[#e8e8e8]">
            <table className="w-full min-w-[600px] text-sm">
              <thead>
                <tr className="border-b border-[#f0f0f0]">
                  <th className="py-4 pl-6 pr-4 text-left font-semibold text-[#0f0f0f]">Feature</th>
                  {["Starter", "Pro", "Agency"].map((p) => (
                    <th key={p} className="px-4 py-4 text-center font-semibold text-[#0f0f0f]">
                      {p}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-[#f9f9f9] ${i % 2 === 1 ? "bg-[#fafafa]" : "bg-white"}`}
                  >
                    <td className="py-3.5 pl-6 pr-4 text-[#52525b]">{row.feature}</td>
                    <td className="px-4 py-3.5 text-center text-[#52525b]">
                      <Cell value={row.starter} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#52525b]">
                      <Cell value={row.pro} />
                    </td>
                    <td className="px-4 py-3.5 text-center text-[#52525b]">
                      <Cell value={row.agency} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 md:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-semibold tracking-tight text-midnight-ink mb-12 text-center">
            Frequently asked questions
          </h2>
          <div className="divide-y divide-[#f0f0f0] rounded-[20px] bg-white border border-[#e8e8e8] shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            {faqs.map((faq) => (
              <div key={faq.q} className="px-7 py-6">
                <p className="font-semibold text-midnight-ink">{faq.q}</p>
                <p className="mt-2.5 text-sm leading-7 text-[#71717a]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-12 pb-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="rounded-[28px] bg-[#0d111b] px-8 py-16 text-center md:px-16">
            <h2 className="text-3xl font-semibold text-white">
              Ready to stop losing submissions?
            </h2>
            <p className="mt-4 text-[#ffffff80] text-lg max-w-lg mx-auto">
              Join hundreds of freelancers and agencies using FormRelay to manage their clients&apos; form submissions.
            </p>
            <Link
              href="/signup"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#0098f2] px-8 py-3.5 text-base font-semibold text-white hover:bg-[#007dd1] transition-colors"
            >
              Start free today
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-white/30">No credit card required</p>
          </div>
        </div>
      </section>
    </main>
  );
}
