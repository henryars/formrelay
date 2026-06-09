"use client";

import { useState } from "react";
import { Sparkles, Copy, Check, ChevronDown, ChevronUp, Code } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectCardProps {
  publicEndpoint: string;
  htmlSnippet: string;
  honeypotFieldName: string;
  aiPrompt: string;
}

export function ConnectCard({
  publicEndpoint,
  htmlSnippet,
  honeypotFieldName,
  aiPrompt,
}: ConnectCardProps) {
  const [copiedAI, setCopiedAI] = useState(false);
  const [copiedHTML, setCopiedHTML] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "react" | "other">("html");

  const copy = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reactSnippet = `"use client";
import { useState, useRef } from "react";

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const ref = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    if (ref.current) ref.current.value = String(Date.now());
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
      <input type="hidden" name="_fr_loaded_at" ref={ref} />
      <button type="submit">Send</button>
    </form>
  );
}`;

  const curlSnippet = `curl -X POST "${publicEndpoint}" \\
  -F "name=Jane Doe" \\
  -F "email=jane@example.com" \\
  -F "message=Hello from curl"`;

  return (
    <div className="space-y-4">
      {/* AI Prompt Card */}
      <div
        className="rounded-[28px] border border-[#0098f2]/20 bg-gradient-to-br from-[#f0f8ff] to-white p-6"
        style={{ boxShadow: "rgba(0,152,242,0.06) 0px 4px 24px 0px" }}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#0098f2]/10">
            <Sparkles className="h-5 w-5 text-[#0098f2]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[#09090b]">Connect with your AI builder</h3>
            <p className="mt-0.5 text-sm text-[#71717a]">
              Copy this prompt and paste it into Lovable, ChatGPT, Replit, or any AI website builder.
              It will wire up your form automatically.
            </p>
          </div>
        </div>

        <div className="relative mt-4">
          <pre className="overflow-x-auto rounded-[16px] bg-[#111113] p-5 text-sm leading-[1.65] text-[#e2e8f0] font-mono whitespace-pre-wrap">
            {aiPrompt}
          </pre>
          <button
            onClick={() => copy(aiPrompt, setCopiedAI)}
            className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded-[10px] bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
          >
            {copiedAI ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copiedAI ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={() => copy(aiPrompt, setCopiedAI)}
            className="mt-3 flex sm:hidden w-full items-center justify-center gap-2 rounded-[14px] bg-[#09090b] px-4 py-3 text-sm font-semibold text-white"
          >
            {copiedAI ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copiedAI ? "Copied!" : "Copy prompt to clipboard"}
          </button>
        </div>
      </div>

      {/* Manual setup accordion */}
      <div
        className="rounded-[28px] bg-white border border-[#ececee]"
        style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
      >
        <button
          onClick={() => setShowManual(!showManual)}
          className="flex w-full items-center justify-between p-6 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#f4f4f5]">
              <Code className="h-4 w-4 text-[#52525b]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b] text-sm">Manual setup</p>
              <p className="text-xs text-[#a1a1aa]">HTML, React, or any framework</p>
            </div>
          </div>
          {showManual ? (
            <ChevronUp className="h-4 w-4 text-[#a1a1aa]" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#a1a1aa]" />
          )}
        </button>

        {showManual && (
          <div className="border-t border-[#ececee] px-6 pb-6">
            <div className="mt-4 flex gap-1 rounded-[12px] bg-[#f4f4f5] p-1 w-fit">
              {(["html", "react", "other"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "rounded-[10px] px-4 py-1.5 text-xs font-semibold transition-all",
                    activeTab === tab
                      ? "bg-white text-[#09090b] shadow-sm"
                      : "text-[#71717a] hover:text-[#09090b]"
                  )}
                >
                  {tab === "html" ? "HTML" : tab === "react" ? "React" : "Other"}
                </button>
              ))}
            </div>

            <div className="relative mt-3">
              <pre className="overflow-x-auto rounded-[16px] bg-[#111113] p-5 text-xs leading-[1.65] text-[#e2e8f0] font-mono">
                {activeTab === "html"
                  ? htmlSnippet
                  : activeTab === "react"
                  ? reactSnippet
                  : curlSnippet}
              </pre>
              <button
                onClick={() =>
                  copy(
                    activeTab === "html" ? htmlSnippet : activeTab === "react" ? reactSnippet : curlSnippet,
                    setCopiedHTML
                  )
                }
                className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded-[10px] bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
              >
                {copiedHTML ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copiedHTML ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={() =>
                  copy(
                    activeTab === "html" ? htmlSnippet : activeTab === "react" ? reactSnippet : curlSnippet,
                    setCopiedHTML
                  )
                }
                className="mt-3 flex sm:hidden w-full items-center justify-center gap-2 rounded-[14px] bg-[#09090b] px-4 py-3 text-sm font-semibold text-white"
              >
                {copiedHTML ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedHTML ? "Copied!" : "Copy code"}
              </button>
            </div>

            {activeTab === "html" && (
              <p className="mt-3 text-xs text-[#a1a1aa]">
                Paste this into your page&apos;s HTML. The hidden fields are handled automatically — don&apos;t remove them.
              </p>
            )}
            {activeTab === "other" && (
              <p className="mt-3 text-xs text-[#a1a1aa]">
                Works with Webflow, Framer, Bubble, Make, Zapier, or any tool that can POST form data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
