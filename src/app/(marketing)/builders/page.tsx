import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

const builders = [
  { name: "Lovable",  hint: "Paste our prompt into Lovable. It wires up your form automatically." },
  { name: "Webflow",  hint: "Set your form action to your FormRelay endpoint. No custom code needed." },
  { name: "Framer",   hint: "Use the HTML embed block with our snippet. Works in minutes." },
  { name: "ChatGPT",  hint: "Give ChatGPT our prompt and it'll update your site's form instantly." },
  { name: "Replit",   hint: "Paste our prompt into Replit and your form is live." },
  { name: "React",    hint: "Drop in our React component. One file, no dependencies." },
];

const steps = [
  "Sign up free — no credit card needed",
  "Add your website and create a form",
  "Copy the one-click prompt for your builder",
  "Paste it in — your form is live",
];

export default function BuildersPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="px-5 pb-20 pt-16 md:px-8 md:pt-24 text-center">
        <div className="mx-auto max-w-[1200px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d4d4d8] bg-white px-4 py-1.5 text-sm font-medium text-[#52525b] shadow-sm mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#0098f2]" />
            Built for AI builders
          </div>
          <h1
            className="max-w-3xl mx-auto text-balance font-black leading-[1.08] tracking-[-0.04em] text-[#09090b]"
            style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)" }}
          >
            Your AI-built website, with a real working form.
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-lg leading-[1.65] text-[#71717a]">
            Lovable, Webflow, Framer, ChatGPT — they all build the form, but they don&apos;t give it a backend.
            FormRelay does that in 60 seconds.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[#09090b] px-7 py-3.5 text-base font-semibold"
              style={{
                color: "#ffffff",
                boxShadow:
                  "rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px",
              }}
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-[#71717a]">
            {["No credit card", "Free plan", "Setup in 2 minutes"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#16a34a]" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Builders grid */}
      <section className="border-t border-[#ececee] bg-white px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[1200px]">
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-[#a1a1aa] mb-12">
            Works with every builder
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {builders.map((b) => (
              <div key={b.name} className="rounded-[28px] bg-[#f4f4f5] p-6">
                <p className="font-black text-lg text-[#09090b]">{b.name}</p>
                <p className="mt-2 text-sm leading-[1.65] text-[#71717a]">{b.hint}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 py-20 md:px-8">
        <div className="mx-auto max-w-[640px] text-center">
          <h2 className="text-3xl font-black tracking-tight text-[#09090b]">
            Four steps. Under 5 minutes.
          </h2>
          <div className="mt-10 space-y-4 text-left">
            {steps.map((step, i) => (
              <div
                key={step}
                className="flex items-center gap-4 rounded-[20px] bg-white border border-[#ececee] p-5"
                style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#09090b] text-xs font-black" style={{ color: "#ffffff" }}>
                  {i + 1}
                </span>
                <p className="text-sm font-semibold text-[#09090b]">{step}</p>
              </div>
            ))}
          </div>
          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#09090b] px-7 py-3.5 text-base font-semibold"
            style={{
              color: "#ffffff",
              boxShadow:
                "rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px",
            }}
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
