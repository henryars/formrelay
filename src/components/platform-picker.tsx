"use client";

import { useState } from "react";
import { Copy, Check, Download, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Types ─────────────────────────────────────────────────────────────── */

type PanelKind = "ai-prompt" | "snippet" | "steps-download" | "steps-endpoint";

interface Step { text: string }

interface Platform {
  id: string;
  name: string;
  logoUrl: string;
  logoBg: string;
  logoInvert?: boolean;
  panel: PanelKind;
  snippetKey?: "html" | "react" | "nextjs" | "curl";
  steps?: Step[];
  downloadSlug?: string;
}

/* ─── Platform data ─────────────────────────────────────────────────────── */

const AI_PLATFORMS: Platform[] = [
  { id: "lovable",  name: "Lovable",  logoUrl: "https://lovable.dev/img/logo/logowhite.svg", logoBg: "#FF3B6B", panel: "ai-prompt" },
  { id: "chatgpt",  name: "ChatGPT",  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/ChatGPT-Logo.svg/960px-ChatGPT-Logo.svg.png", logoBg: "#ffffff", panel: "ai-prompt" },
  { id: "gemini",   name: "Gemini",   logoUrl: "https://cdn.simpleicons.org/googlegemini", logoBg: "#ffffff", panel: "ai-prompt" },
  { id: "replit",   name: "Replit",   logoUrl: "https://cdn.simpleicons.org/replit",        logoBg: "#ffffff", panel: "ai-prompt" },
  { id: "bolt",     name: "Bolt",     logoUrl: "https://cdn.jsdelivr.net/gh/callback-io/allogo@main/public/logos/bolt/icon.svg", logoBg: "#09090b", panel: "ai-prompt" },
  { id: "claude",   name: "Claude",   logoUrl: "https://cdn.simpleicons.org/claude",         logoBg: "#ffffff", panel: "ai-prompt" },
];

const CODE_PLATFORMS: Platform[] = [
  { id: "html",    name: "HTML",    logoUrl: "https://cdn.simpleicons.org/html5",     logoBg: "#ffffff", panel: "snippet", snippetKey: "html" },
  { id: "react",   name: "React",   logoUrl: "https://cdn.simpleicons.org/react",     logoBg: "#20232a", panel: "snippet", snippetKey: "react" },
  { id: "nextjs",  name: "Next.js", logoUrl: "https://cdn.simpleicons.org/nextdotjs", logoBg: "#ffffff", panel: "snippet", snippetKey: "nextjs" },
  { id: "vue",     name: "Vue",     logoUrl: "https://cdn.simpleicons.org/vuedotjs",  logoBg: "#ffffff", panel: "snippet", snippetKey: "html" },
  { id: "angular", name: "Angular", logoUrl: "https://cdn.simpleicons.org/angular",   logoBg: "#ffffff", panel: "snippet", snippetKey: "html" },
  { id: "curl",    name: "cURL",    logoUrl: "https://cdn.simpleicons.org/curl",      logoBg: "#ffffff", panel: "snippet", snippetKey: "curl" },
];

const PLATFORM_CARDS: Platform[] = [
  {
    id: "wordpress",
    name: "WordPress",
    logoUrl: "https://cdn.simpleicons.org/wordpress",
    logoBg: "#ffffff",
    panel: "steps-download",
    downloadSlug: "wordpress",
    steps: [
      { text: "Download the FormRelay plugin zip using the button below." },
      { text: "In WordPress go to Plugins → Add New → Upload Plugin." },
      { text: "Upload the zip, then install and activate." },
      { text: "Go to Settings → FormRelay and paste your Endpoint URL." },
      { text: "Submit a test message — it appears in your inbox instantly." },
    ],
  },
  {
    id: "elementor",
    name: "Elementor",
    logoUrl: "https://cdn.simpleicons.org/elementor",
    logoBg: "#ffffff",
    panel: "steps-download",
    downloadSlug: "elementor",
    steps: [
      { text: "Download the FormRelay for Elementor plugin zip below." },
      { text: "Upload and activate it in WordPress (Plugins → Add New → Upload)." },
      { text: "Edit a page in Elementor, open a Form widget, and go to Actions After Submit." },
      { text: 'Add the "FormRelay" action — a settings section appears below.' },
      { text: "Paste your Endpoint URL and publish. Done." },
    ],
  },
  {
    id: "framer",
    name: "Framer",
    logoUrl: "https://cdn.simpleicons.org/framer",
    logoBg: "#000000",
    logoInvert: true,
    panel: "steps-endpoint",
    steps: [
      { text: "Select your Form component in Framer." },
      { text: 'Open the Interactions panel and set Submit to "Send to URL".' },
      { text: "Paste your Endpoint URL (copy it with the button below)." },
      { text: "Publish — submissions arrive in your FormRelay inbox." },
    ],
  },
  {
    id: "webflow",
    name: "Webflow",
    logoUrl: "https://cdn.simpleicons.org/webflow",
    logoBg: "#ffffff",
    panel: "steps-endpoint",
    steps: [
      { text: "Select your Form block in the Webflow designer." },
      { text: 'Open Form Settings and enable "Send form data to a webhook URL".' },
      { text: "Paste your Endpoint URL (copy it with the button below)." },
      { text: "Publish and send a test submission to confirm." },
    ],
  },
  {
    id: "wix",
    name: "Wix",
    logoUrl: "https://cdn.simpleicons.org/wix",
    logoBg: "#ffffff",
    panel: "steps-endpoint",
    steps: [
      { text: "Enable Velo in your Wix site via the Dev Mode toggle." },
      { text: "Open Events & Hooks and add a handler for your form's onSubmit event." },
      { text: "Use fetch to POST field values to your Endpoint URL (copy below)." },
      { text: "Publish and submit a test entry to confirm delivery." },
    ],
  },
];

/* ─── Chip ───────────────────────────────────────────────────────────────── */

function Chip({ platform, active, onClick }: { platform: Platform; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 rounded-[14px] border px-2.5 py-2.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0098f2] w-[64px] sm:w-[72px]",
        active
          ? "border-[#09090b] bg-[#09090b] shadow-sm"
          : "border-[#ececee] bg-white hover:border-[#d4d4d8] hover:bg-[#fafafa]"
      )}
    >
      <span
        className="flex h-8 w-8 items-center justify-center rounded-[10px] overflow-hidden shrink-0"
        style={{ background: platform.logoBg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={platform.logoUrl}
          alt={platform.name}
          width={20}
          height={20}
          className={cn("object-contain", platform.logoInvert && "brightness-0 invert")}
          style={{ width: 20, height: 20 }}
        />
      </span>
      <span className={cn("text-[11px] font-semibold leading-none text-center w-full truncate", active ? "text-white" : "text-[#52525b]")}>
        {platform.name}
      </span>
    </button>
  );
}

/* ─── Step list ─────────────────────────────────────────────────────────── */

function StepList({ steps }: { steps: Step[] }) {
  return (
    <ol className="space-y-2.5 mb-4">
      {steps.map((step, i) => (
        <li key={i} className="flex gap-3">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0098f2]/10 text-[11px] font-bold text-[#0098f2] mt-0.5">
            {i + 1}
          </span>
          <p className="text-sm text-[#52525b] leading-relaxed">{step.text}</p>
        </li>
      ))}
    </ol>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */

interface PlatformPickerProps {
  aiPrompt: string;
  publicEndpoint: string;
  honeypotFieldName: string;
}

export function PlatformPicker({ aiPrompt, publicEndpoint, honeypotFieldName }: PlatformPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const allPlatforms = [...AI_PLATFORMS, ...CODE_PLATFORMS, ...PLATFORM_CARDS];
  const active = allPlatforms.find((p) => p.id === selected) ?? null;

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function download(slug: string) {
    setDownloading(true);
    try {
      const res = await fetch(`/api/integrations/download/${slug}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formrelay-${slug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  function toggle(p: Platform) {
    setSelected((prev) => (prev === p.id ? null : p.id));
  }

  const snippets: Record<string, string> = {
    html: `<form action="${publicEndpoint}" method="POST">
  <input name="name" placeholder="Your name" required />
  <input name="email" type="email" placeholder="Your email" required />
  <textarea name="message" placeholder="Your message"></textarea>
  <input name="${honeypotFieldName}" tabindex="-1" autocomplete="off"
    style="position:absolute;left:-9999px;opacity:0;height:0;width:0;" />
  <input type="hidden" name="_fr_loaded_at" />
  <button type="submit">Send message</button>
</form>
<script>
  const f = document.querySelector('input[name="_fr_loaded_at"]');
  if (f) f.value = String(Date.now());
</script>`,

    react: `"use client";
import { useState } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("_fr_loaded_at", String(Date.now()));
    await fetch("${publicEndpoint}", { method: "POST", body: data });
    setSent(true);
  }

  if (sent) return <p>Thank you! Your message has been sent.</p>;

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Your name" required />
      <input name="email" type="email" placeholder="Your email" required />
      <textarea name="message" placeholder="Your message" />
      <input name="${honeypotFieldName}" tabIndex={-1}
        style={{ position: "absolute", left: -9999 }} />
      <button type="submit">Send</button>
    </form>
  );
}`,

    nextjs: `// app/contact/page.tsx
"use client";
import { useState } from "react";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    data.set("_fr_loaded_at", String(Date.now()));
    await fetch("${publicEndpoint}", { method: "POST", body: data });
    setSent(true);
  }

  if (sent) return <p>Thank you! Your message has been sent.</p>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input name="name" placeholder="Your name" required className="w-full border rounded p-2" />
      <input name="email" type="email" placeholder="Your email" required className="w-full border rounded p-2" />
      <textarea name="message" placeholder="Your message" className="w-full border rounded p-2" />
      <input name="${honeypotFieldName}" tabIndex={-1} style={{ position: "absolute", left: -9999 }} />
      <button type="submit" className="bg-black text-white px-4 py-2 rounded">Send</button>
    </form>
  );
}`,

    curl: `curl -X POST "${publicEndpoint}" \\
  -F "name=Jane Doe" \\
  -F "email=jane@example.com" \\
  -F "message=Hello from curl"`,
  };

  /* Determine panel content */
  let panelContent: React.ReactNode = null;

  if (active) {
    if (active.panel === "ai-prompt") {
      panelContent = (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#52525b]">Copy this prompt and paste it into {active.name}</p>
            <button
              onClick={() => copy(aiPrompt)}
              className="flex items-center gap-1.5 rounded-[10px] bg-[#f4f4f5] px-3 py-1.5 text-xs font-semibold text-[#52525b] hover:bg-[#ececee] transition-colors shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-[16px] bg-[#111113] p-4 text-xs leading-[1.65] text-[#e2e8f0] font-mono whitespace-pre-wrap break-words">
            {aiPrompt}
          </pre>
        </>
      );
    } else if (active.panel === "snippet" && active.snippetKey) {
      const code = snippets[active.snippetKey];
      panelContent = (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-[#52525b]">Paste into your {active.name} project</p>
            <button
              onClick={() => copy(code)}
              className="flex items-center gap-1.5 rounded-[10px] bg-[#f4f4f5] px-3 py-1.5 text-xs font-semibold text-[#52525b] hover:bg-[#ececee] transition-colors shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre className="overflow-x-auto rounded-[16px] bg-[#111113] p-4 text-xs leading-[1.65] text-[#e2e8f0] font-mono whitespace-pre-wrap break-words">
            {code}
          </pre>
        </>
      );
    } else if (active.panel === "steps-download" && active.steps) {
      panelContent = (
        <>
          <StepList steps={active.steps} />
          <button
            onClick={() => active.downloadSlug && download(active.downloadSlug)}
            disabled={downloading}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-bold transition-all",
              downloading
                ? "bg-[#f4f4f5] text-[#a1a1aa] cursor-not-allowed"
                : "bg-[#09090b] text-white hover:bg-[#18181b]"
            )}
          >
            <Download className="h-4 w-4 shrink-0" />
            {downloading ? "Preparing…" : `Download ${active.name} plugin`}
          </button>
        </>
      );
    } else if (active.panel === "steps-endpoint" && active.steps) {
      panelContent = (
        <>
          <StepList steps={active.steps} />
          <div className="flex items-center gap-2">
            <code className="flex-1 min-w-0 text-xs font-mono font-semibold text-[#09090b] bg-[#f4f4f5] px-3 py-2.5 rounded-[12px] border border-[#ececee] truncate">
              {publicEndpoint}
            </code>
            <button
              onClick={() => copy(publicEndpoint)}
              className="flex shrink-0 items-center gap-1.5 rounded-[12px] bg-[#09090b] px-3 py-2.5 text-xs font-bold text-white hover:bg-[#18181b] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied!" : "Copy URL"}
            </button>
          </div>
        </>
      );
    }
  }

  return (
    <div
      className="rounded-[28px] bg-white border border-[#ececee]"
      style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
    >
      <div className="p-5 sm:p-6 pb-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-4">
          Connect with your stack
        </p>

        {/* AI Builders */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[#a1a1aa] mb-2.5">AI builders</p>
          <div className="flex flex-wrap gap-2">
            {AI_PLATFORMS.map((p) => (
              <Chip key={p.id} platform={p} active={selected === p.id} onClick={() => toggle(p)} />
            ))}
          </div>
        </div>

        {/* Code frameworks */}
        <div className="mb-5">
          <p className="text-[11px] font-semibold text-[#a1a1aa] mb-2.5">Frameworks & code</p>
          <div className="flex flex-wrap gap-2">
            {CODE_PLATFORMS.map((p) => (
              <Chip key={p.id} platform={p} active={selected === p.id} onClick={() => toggle(p)} />
            ))}
          </div>
        </div>

        {/* Platforms */}
        <div>
          <p className="text-[11px] font-semibold text-[#a1a1aa] mb-2.5">Platforms & plugins</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_CARDS.map((p) => (
              <Chip key={p.id} platform={p} active={selected === p.id} onClick={() => toggle(p)} />
            ))}
            <a
              href="/dashboard/integrations"
              className="flex flex-col items-center gap-1.5 rounded-[14px] border border-dashed border-[#d4d4d8] bg-white px-2.5 py-2.5 hover:bg-[#fafafa] transition-colors w-[64px] sm:w-[72px]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f4f4f5]">
                <ExternalLink className="h-3.5 w-3.5 text-[#a1a1aa]" />
              </span>
              <span className="text-[11px] font-semibold text-[#a1a1aa] leading-none">More</span>
            </a>
          </div>
        </div>
      </div>

      {/* Panel */}
      {panelContent && (
        <div className="border-t border-[#f4f4f5] px-5 sm:px-6 pb-5 sm:pb-6 pt-4">
          {panelContent}
        </div>
      )}
    </div>
  );
}
