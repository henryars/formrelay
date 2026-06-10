"use client";

import { useState } from "react";
import { Sparkles, Copy, Check } from "lucide-react";

interface ConnectCardProps {
  publicEndpoint: string;
  htmlSnippet: string;
  honeypotFieldName: string;
  aiPrompt: string;
}

export function ConnectCard({ aiPrompt }: ConnectCardProps) {
  const [copied, setCopied] = useState(false);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="rounded-[28px] border border-[#0098f2]/20 bg-gradient-to-br from-[#f0f8ff] to-white p-5 sm:p-6"
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
        <pre className="overflow-x-auto rounded-[16px] bg-[#111113] p-4 sm:p-5 text-sm leading-[1.65] text-[#e2e8f0] font-mono whitespace-pre-wrap break-words">
          {aiPrompt}
        </pre>
        <button
          onClick={() => copy(aiPrompt)}
          className="absolute top-3 right-3 hidden sm:flex items-center gap-1.5 rounded-[10px] bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied!" : "Copy"}
        </button>
        <button
          onClick={() => copy(aiPrompt)}
          className="mt-3 flex sm:hidden w-full items-center justify-center gap-2 rounded-[14px] bg-[#09090b] px-4 py-3 text-sm font-semibold text-white"
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy prompt to clipboard"}
        </button>
      </div>
    </div>
  );
}
