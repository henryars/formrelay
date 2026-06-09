"use client";

import { useState } from "react";
import { X, Mail, Phone, Globe, Clock, Tag, ShieldCheck, ExternalLink } from "lucide-react";

type Submission = {
  id: string;
  submitterName: string | null;
  submitterEmail: string | null;
  submitterPhone: string | null;
  messagePreview: string | null;
  spamStatus: string;
  spamScore: number;
  status: string;
  createdAt: Date;
  sourceUrl: string | null;
  fieldItems: unknown;
  form: { formName: string };
  website: { websiteName: string };
};

function parseFields(raw: unknown): { key: string; label: string | null; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((f: { key?: string; label?: string; value?: unknown }) => ({
    key: f.key ?? "",
    label: f.label ?? f.key ?? "",
    value: Array.isArray(f.value) ? f.value.join(", ") : String(f.value ?? ""),
  }));
}

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  }).format(new Date(d));
}

function formatTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(d));
}

function SpamBadge({ status, score }: { status: string; score: number }) {
  if (status === "CLEAN") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
        style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}>
        <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "#16a34a" }} />
        Clean
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
      <span className="h-1.5 w-1.5 rounded-full inline-block" style={{ background: "#f59e0b" }} />
      Maybe spam · {score}
    </span>
  );
}

export function SubmissionsTable({ submissions }: { submissions: Submission[] }) {
  const [selected, setSelected] = useState<Submission | null>(null);

  return (
    <>
      {/* ── Table ── */}
      <div className="rounded-[20px] overflow-hidden border border-[#ececee]"
        style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}>
        {/* Header */}
        <div className="grid bg-[#fafafa] border-b border-[#ececee] px-5 py-3"
          style={{ gridTemplateColumns: "1fr 180px 120px 110px 80px" }}>
          {["Sender", "Form", "Website", "Status", ""].map((h) => (
            <span key={h} className="text-[11px] font-semibold uppercase tracking-wider text-[#a1a1aa]">{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-[#f4f4f5] bg-white">
          {submissions.map((sub) => (
            <div key={sub.id}
              className="grid items-center px-5 py-3.5 hover:bg-[#fafafa] transition-colors"
              style={{ gridTemplateColumns: "1fr 180px 120px 110px 80px" }}>

              {/* Sender */}
              <div className="min-w-0 pr-4">
                <p className="text-sm font-semibold text-[#09090b] truncate">
                  {sub.submitterName ?? "Unknown sender"}
                </p>
                <p className="text-xs text-[#a1a1aa] truncate mt-0.5">
                  {sub.submitterEmail ?? "—"}
                </p>
                {sub.messagePreview && (
                  <p className="text-xs text-[#71717a] mt-1 line-clamp-1">{sub.messagePreview}</p>
                )}
              </div>

              {/* Form */}
              <div className="truncate">
                <span className="text-xs font-medium text-[#52525b] truncate">{sub.form.formName}</span>
                <p className="text-[11px] text-[#a1a1aa] mt-0.5">{formatDate(sub.createdAt)}</p>
              </div>

              {/* Website */}
              <span className="text-xs text-[#71717a] truncate">{sub.website.websiteName}</span>

              {/* Status */}
              <SpamBadge status={sub.spamStatus} score={sub.spamScore} />

              {/* Action */}
              <div className="flex justify-end">
                <button
                  onClick={() => setSelected(sub)}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                  style={{ background: "#f4f4f5", color: "#3f3f46" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "#e4e4e7";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "#f4f4f5";
                  }}
                >
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Slide-over overlay ── */}
      {selected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
            onClick={() => setSelected(null)}
          />

          {/* Panel */}
          <div
            className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white sm:w-[480px]"
            style={{ boxShadow: "-8px 0 40px rgba(0,0,0,0.12)" }}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#ececee]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Message</p>
                <h2 className="mt-0.5 text-lg font-black text-[#09090b]">
                  {selected.submitterName ?? "Unknown sender"}
                </h2>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full transition-colors"
                style={{ background: "#f4f4f5", color: "#71717a" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#e4e4e7"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#f4f4f5"}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Status row */}
              <div className="flex items-center gap-2 flex-wrap">
                <SpamBadge status={selected.spamStatus} score={selected.spamScore} />
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: "#f4f4f5", color: "#52525b", border: "1px solid #ececee" }}>
                  <Tag className="h-3 w-3" />
                  {selected.form.formName}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                  style={{ background: "#f4f4f5", color: "#52525b", border: "1px solid #ececee" }}>
                  <Globe className="h-3 w-3" />
                  {selected.website.websiteName}
                </span>
              </div>

              {/* Contact info */}
              <div className="rounded-[16px] bg-[#fafafa] border border-[#ececee] divide-y divide-[#ececee]">
                {selected.submitterEmail && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Mail className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
                    <div>
                      <p className="text-[11px] text-[#a1a1aa]">Email</p>
                      <a href={`mailto:${selected.submitterEmail}`}
                        className="text-sm font-medium text-[#0098f2] hover:underline">
                        {selected.submitterEmail}
                      </a>
                    </div>
                  </div>
                )}
                {selected.submitterPhone && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Phone className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
                    <div>
                      <p className="text-[11px] text-[#a1a1aa]">Phone</p>
                      <p className="text-sm font-medium text-[#09090b]">{selected.submitterPhone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Clock className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
                  <div>
                    <p className="text-[11px] text-[#a1a1aa]">Received</p>
                    <p className="text-sm font-medium text-[#09090b]">
                      {formatDate(selected.createdAt)} at {formatTime(selected.createdAt)}
                    </p>
                  </div>
                </div>
                {selected.sourceUrl && (
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Globe className="h-4 w-4 shrink-0 text-[#a1a1aa]" />
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#a1a1aa]">Page</p>
                      <a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-mono text-[#71717a] truncate block hover:text-[#0098f2]">
                        {selected.sourceUrl}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Message */}
              {selected.messagePreview && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-2">Message</p>
                  <div className="rounded-[16px] bg-[#f4f4f5] px-4 py-4">
                    <p className="text-sm leading-relaxed text-[#09090b] whitespace-pre-wrap">
                      {selected.messagePreview}
                    </p>
                  </div>
                </div>
              )}

              {/* All fields */}
              {(() => {
                const fields = parseFields(selected.fieldItems);
                if (!fields.length) return null;
                return (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-2">All fields</p>
                    <div className="rounded-[16px] border border-[#ececee] divide-y divide-[#ececee]">
                      {fields.map((f, i) => (
                        <div key={`${f.key}-${i}`} className="px-4 py-3 grid grid-cols-[120px_1fr] gap-3">
                          <p className="text-[11px] font-semibold text-[#a1a1aa] uppercase tracking-wide truncate">
                            {f.label || f.key}
                          </p>
                          <p className="text-sm text-[#09090b] break-words">{f.value || "—"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Spam info */}
              {selected.spamStatus === "SUSPICIOUS" && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa] mb-2">Spam score</p>
                  <div className="rounded-[16px] bg-[#fffbeb] border border-[#fde68a] px-4 py-3 flex items-center gap-3">
                    <ShieldCheck className="h-4 w-4 text-[#d97706] shrink-0" />
                    <p className="text-sm text-[#92400e]">
                      Score <strong>{selected.spamScore}</strong> — flagged as possibly suspicious. Review before responding.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div className="border-t border-[#ececee] px-6 py-4 flex items-center justify-between gap-3">
              <a
                href={`/dashboard/submissions/${selected.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0098f2] hover:text-[#007dd1] transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Open full detail
              </a>
              {selected.submitterEmail && (
                <a
                  href={`mailto:${selected.submitterEmail}`}
                  className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors"
                  style={{ backgroundColor: "#09090b", color: "#ffffff" }}
                >
                  <Mail className="h-3.5 w-3.5" />
                  Reply
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
