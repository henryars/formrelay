"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Download, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Integration } from "@/app/dashboard/integrations/page";
import {
  WordPressLogo,
  ElementorLogo,
  FramerLogo,
  WebflowLogo,
  WixLogo,
  SquarespaceLogo,
} from "@/components/platform-logos";

const LOGOS: Record<string, React.ComponentType<{ className?: string }>> = {
  wordpress: WordPressLogo,
  elementor: ElementorLogo,
  framer: FramerLogo,
  webflow: WebflowLogo,
  wix: WixLogo,
  squarespace: SquarespaceLogo,
};

interface IntegrationCardProps {
  integration: Integration;
  featured?: boolean;
}

export function IntegrationCard({ integration, featured = false }: IntegrationCardProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const Logo = LOGOS[integration.logoId];

  async function handleDownload() {
    if (!integration.downloadSlug) return;
    setDownloading(true);
    try {
      const res = await fetch(`/api/integrations/download/${integration.downloadSlug}`);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `formrelay-${integration.downloadSlug}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  }

  const badgeLabel =
    integration.type === "plugin"
      ? "Plugin"
      : integration.type === "snippet"
      ? "Code override"
      : "No plugin";

  const badgeColor =
    integration.type === "plugin"
      ? "bg-[#0098f2]/10 text-[#0074c2]"
      : integration.type === "snippet"
      ? "bg-purple-50 text-purple-700"
      : "bg-emerald-50 text-emerald-700";

  const DownloadButton = ({ full = false }: { full?: boolean }) => (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={cn(
        "flex items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-bold transition-all",
        full ? "w-full" : "",
        downloading
          ? "bg-[#f4f4f5] text-[#a1a1aa] cursor-not-allowed"
          : "bg-[#09090b] text-white hover:bg-[#18181b]"
      )}
    >
      <Download className="h-4 w-4 shrink-0" />
      {downloading ? "Preparing…" : `Download ${integration.name} plugin`}
    </button>
  );

  return (
    <div
      className={cn(
        "rounded-[28px] bg-white border border-[#ececee] overflow-hidden transition-shadow flex flex-col",
        featured ? "shadow-[0_4px_24px_rgba(0,0,0,0.07)]" : "shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
      )}
    >
      {/* Card header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-[#f4f4f5]">
            {Logo && <Logo className="h-6 w-6 text-[#09090b]" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-[#09090b] text-base">{integration.name}</h2>
              <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeColor)}>
                {badgeLabel}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-[#a1a1aa]">{integration.tagline}</p>
          </div>
        </div>

        <p className="mt-4 text-sm text-[#52525b] leading-relaxed">{integration.description}</p>

        {integration.supports && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {integration.supports.map((s) => (
              <span
                key={s}
                className="rounded-full bg-[#f4f4f5] px-2.5 py-1 text-[11px] font-medium text-[#71717a]"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expandable steps */}
      <div className="border-t border-[#f4f4f5]">
        <button
          onClick={() => setOpen(!open)}
          className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-[#fafafa] transition-colors"
        >
          <span className="text-sm font-semibold text-[#09090b]">Setup instructions</span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-[#a1a1aa] shrink-0" />
          ) : (
            <ChevronDown className="h-4 w-4 text-[#a1a1aa] shrink-0" />
          )}
        </button>

        {open && (
          <div className="px-6 pb-5">
            <ol className="space-y-3">
              {integration.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0098f2]/10 text-[11px] font-bold text-[#0098f2] mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#52525b] leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>

          </div>
        )}
      </div>

      {/* Footer — always visible */}
      <div className="mt-auto border-t border-[#f4f4f5] px-6 py-4">
        {integration.type === "plugin" && integration.downloadSlug ? (
          <DownloadButton full />
        ) : (
          <div className="flex items-center gap-2 text-sm text-[#71717a]">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>No plugin installation required</span>
          </div>
        )}
      </div>
    </div>
  );
}
