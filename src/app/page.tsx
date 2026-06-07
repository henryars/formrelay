import { ArrowRight, CheckCircle2, ChevronRight, Database, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";

const featureChecks = [
  "2.7% card fee compatible",
  "Works with static and AI-built sites",
  "Spam blocked before it hits the inbox",
];

const supportedBuilders = [
  "Webflow",
  "Framer",
  "Lovable",
  "Gemini",
  "ChatGPT",
  "React",
  "Next.js",
  "Plain HTML",
];

const featureCards = [
  {
    title: "Universal form backend",
    body: "Connect existing forms without redesigning them. Every form gets its own endpoint, storage inbox, and recipient flow.",
    accent: "bg-wash-sky",
    icon: Database,
  },
  {
    title: "AWS SES notifications",
    body: "Clean submissions trigger formatted email alerts with Reply-To set to the submitter so teams can respond fast.",
    accent: "bg-wash-lilac",
    icon: Mail,
  },
  {
    title: "Spam-aware intake",
    body: "Public endpoints stay usable with honeypots, content scoring, IP hashing, and suspicious-submission routing.",
    accent: "bg-wash-petal",
    icon: ShieldCheck,
  },
];

const faqs = [
  "Can I use FormRelay with forms that already exist on my site?",
  "Does it work for Webflow, Framer, and AI-generated websites?",
  "Can I route different forms to different recipient emails?",
  "Will spam submissions count against my plan?",
];

export default function Home() {
  return (
    <main className="flex-1">
      <section className="relative overflow-hidden px-6 pb-24 pt-10 md:px-8 md:pt-16">
        <div className="pointer-events-none absolute -left-24 top-24 hidden h-64 w-64 rounded-[32px] bg-white shadow-subtle lg:block" />
        <div className="pointer-events-none absolute -right-24 top-20 hidden h-72 w-72 rounded-[32px] bg-wash-lilac lg:block" />

        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-center text-center">
          <span className="rounded-full px-3 py-1 text-sm font-medium text-invoice-blue">
            Existing forms, finally connected
          </span>
          <h1 className="mt-6 max-w-5xl text-balance text-[3.2rem] font-semibold leading-[1.02] tracking-[-0.05em] text-midnight-ink md:text-[4.75rem]">
            Make any website form work without building a backend.
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-charcoal-whisper md:text-xl">
            FormRelay gives static websites, no-code projects, and AI-built landing pages a
            proper submission endpoint, spam protection, storage inbox, and AWS SES notifications.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link className="button-primary" href="/dashboard">
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a className="button-secondary" href="#how-it-works">
              See how it works
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm font-medium text-charcoal-whisper">
            {featureChecks.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-invoice-blue" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-16 grid w-full gap-8 rounded-[32px] bg-white p-8 shadow-subtle md:grid-cols-[1.15fr_0.85fr] md:p-10">
            <div className="rounded-[32px] bg-cool-mist p-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-graphite-mute">Contact Form</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-midnight-ink">
                    Endpoint ready
                  </h2>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-sm text-invoice-blue">
                  Active
                </span>
              </div>

              <div className="mt-6 rounded-[20px] bg-white p-5 shadow-subtle">
                <p className="text-sm text-graphite-mute">Endpoint URL</p>
                <p className="mt-2 break-all text-sm font-medium text-midnight-ink">
                  https://api.formrelay.com/f/fm_abc123
                </p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[20px] bg-wash-petal p-4">
                    <p className="text-sm text-graphite-mute">Recipient</p>
                    <p className="mt-2 font-medium text-midnight-ink">hello@clientsite.com</p>
                  </div>
                  <div className="rounded-[20px] bg-wash-sky p-4">
                    <p className="text-sm text-graphite-mute">Spam score</p>
                    <p className="mt-2 font-medium text-midnight-ink">0-39 clean routing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] bg-wash-lilac p-6 text-left">
              <p className="text-sm text-graphite-mute">Latest submission</p>
              <div className="mt-6 rounded-[20px] bg-white p-5 shadow-subtle">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-midnight-ink">John Doe</p>
                    <p className="mt-1 text-sm text-charcoal-whisper">john@example.com</p>
                  </div>
                  <span className="rounded-full bg-cool-mist px-3 py-1 text-sm text-midnight-ink">
                    New
                  </span>
                </div>
                <p className="mt-5 text-sm leading-7 text-charcoal-whisper">
                  I need a website for my restaurant and I would love a quote for design, copy,
                  and launch support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-cool-mist px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium uppercase tracking-[0.16em] text-graphite-mute">
          {supportedBuilders.map((builder) => (
            <span key={builder}>{builder}</span>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-24 md:px-8">
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-medium text-invoice-blue">How it works</p>
            <h2 className="mt-3 max-w-md text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
              Built for the forms you already have.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Add a website and recipient email.",
              "Create a form inbox and copy the endpoint.",
              "Connect your existing form and watch submissions land.",
            ].map((step, index) => (
              <div key={step} className="rounded-[20px] bg-white p-6 shadow-subtle">
                <p className="text-sm font-medium text-invoice-blue">0{index + 1}</p>
                <p className="mt-6 text-lg leading-8 text-midnight-ink">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cool-mist px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-invoice-blue">Core features</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
              The backend layer AI builders keep skipping.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article key={feature.title} className="rounded-[20px] bg-white p-6 shadow-subtle">
                  <div className={`inline-flex rounded-[20px] p-3 ${feature.accent}`}>
                    <Icon className="h-5 w-5 text-midnight-ink" />
                  </div>
                  <h3 className="mt-6 text-2xl font-semibold tracking-tight text-midnight-ink">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base leading-8 text-charcoal-whisper">{feature.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1200px] rounded-[32px] bg-white p-8 shadow-subtle md:p-10">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm font-medium text-invoice-blue">FAQs</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-midnight-ink">
                Clear enough for client work.
              </h2>
            </div>
            <div>
              {faqs.map((faq) => (
                <div
                  key={faq}
                  className="flex items-center justify-between border-t border-stone-edge py-5 text-midnight-ink"
                >
                  <span className="text-base font-medium">{faq}</span>
                  <ChevronRight className="h-5 w-5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
