import Link from "next/link";
import {
  Globe,
  FileText,
  Inbox,
  ShieldAlert,
  Plus,
  ArrowRight,
  ExternalLink,
  Circle,
} from "lucide-react";

import { getDashboardData } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, workspace, websites, forms, submissions, spamCount, recentSubmissions } =
    await getDashboardData();

  const hasWebsites = websites.length > 0;
  const hasForms = forms.length > 0;

  const stats = [
    { label: "Websites",     value: websites.length, icon: Globe,       href: "/dashboard/websites"    },
    { label: "Forms",        value: forms.length,    icon: FileText,    href: "/dashboard/forms"       },
    { label: "Messages",     value: submissions,     icon: Inbox,       href: "/dashboard/submissions" },
    { label: "Spam blocked", value: spamCount,       icon: ShieldAlert, href: "/dashboard/spam"        },
  ];

  return (
    <div className="px-5 py-8 md:px-8 max-w-5xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#a1a1aa]">Dashboard</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#09090b]">
            {hasWebsites
              ? `Good to see you, ${user.fullName.split(" ")[0]}`
              : "Welcome to FormRelay"}
          </h1>
          <p className="mt-1 text-sm text-[#71717a]">{workspace.workspaceName}</p>
        </div>
        {hasWebsites && (
          <Link
            href="/dashboard/websites/new"
            className="inline-flex items-center gap-1.5 rounded-full shrink-0 px-4 py-2 text-xs font-bold"
            style={{
              backgroundColor: "#09090b",
              color: "#ffffff",
              boxShadow:
                "rgba(255,255,255,0.5) 0px 0.5px 0px 0px inset, rgba(117,123,133,0.4) 0px 9px 14px -5px inset, rgb(44,46,52) 0px 0px 0px 1.5px, rgba(0,0,0,0.14) 0px 4px 6px 0px",
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Add website
          </Link>
        )}
      </div>

      {/* ── Empty state ── */}
      {!hasWebsites && (
        <div className="rounded-[36px] bg-[#09090b] px-8 py-12 text-center">
          <h2 className="text-2xl font-black text-white">
            Let&apos;s get your first form working
          </h2>
          <p className="mt-3 text-base text-white/60 max-w-md mx-auto">
            You&apos;re 3 steps away from receiving messages from your website — without any server or backend.
          </p>
          <Link
            href="/dashboard/onboarding"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-[#09090b] hover:bg-[#f4f4f5] transition-colors"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-xl mx-auto text-left">
            {[
              { icon: Globe,     step: "Add your website", hint: "30 seconds"  },
              { icon: FileText,  step: "Create a form",    hint: "Instant"     },
              { icon: Inbox,     step: "Connect and test", hint: "Copy & paste" },
            ].map(({ icon: Icon, step, hint }) => (
              <div key={step} className="rounded-[16px] bg-white/[0.06] p-4 flex items-start gap-3">
                <Icon className="h-4 w-4 text-white/40 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-white/80">{step}</p>
                  <p className="text-[11px] text-white/30 mt-0.5">{hint}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Partial setup nudge ── */}
      {hasWebsites && !hasForms && (
        <div
          className="rounded-[28px] bg-white border border-[#ececee] p-6 flex items-center gap-5"
          style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#f4f4f5]">
            <FileText className="h-5 w-5 text-[#71717a]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-[#09090b]">Create your first form</p>
            <p className="text-sm text-[#71717a] mt-0.5">
              You have a website but no forms yet. Create one to get your form&apos;s unique address.
            </p>
          </div>
          <Link
            href="/dashboard/forms/new"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold"
            style={{ backgroundColor: "#09090b", color: "#ffffff" }}
          >
            Create form
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Stats ── */}
      {hasWebsites && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link
                key={stat.label}
                href={stat.href}
                className="rounded-[24px] bg-white border border-[#ececee] p-5 hover:border-[#d4d4d8] transition-all"
                style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#a1a1aa] uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <Icon className="h-3.5 w-3.5 text-[#d4d4d8]" />
                </div>
                <p className="text-3xl font-black text-[#09090b] tabular-nums">{stat.value}</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Main content ── */}
      {hasWebsites && (
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          {/* Websites */}
          <div
            className="rounded-[28px] bg-white border border-[#ececee]"
            style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="font-bold text-[#09090b]">Websites</h2>
              <Link
                href="/dashboard/websites/new"
                className="inline-flex items-center gap-1 rounded-full bg-[#f4f4f5] px-3 py-1.5 text-xs font-semibold text-[#52525b] hover:bg-[#ececee] transition-colors"
              >
                <Plus className="h-3 w-3" /> Add
              </Link>
            </div>
            <div className="mt-4 divide-y divide-[#f4f4f5]">
              {websites.map((website) => (
                <Link
                  key={website.id}
                  href={`/dashboard/websites/${website.id}`}
                  className="flex items-center justify-between px-6 py-3.5 hover:bg-[#fafafa] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#09090b] truncate">{website.websiteName}</p>
                    <p className="text-xs text-[#a1a1aa] font-mono truncate">{website.websiteUrl}</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4 shrink-0">
                    <div className="text-center">
                      <p className="text-sm font-black text-[#09090b]">{website.forms.length}</p>
                      <p className="text-[11px] text-[#a1a1aa]">forms</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-black text-[#09090b]">{website._count.submissions}</p>
                      <p className="text-[11px] text-[#a1a1aa]">messages</p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-[#d4d4d8]" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent messages */}
          <div
            className="rounded-[28px] bg-white border border-[#ececee]"
            style={{ boxShadow: "rgba(0,0,0,0.04) 0px 4px 12px 0px" }}
          >
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="font-bold text-[#09090b]">Recent messages</h2>
              <Link
                href="/dashboard/submissions"
                className="text-xs font-semibold text-[#0098f2] hover:text-[#007dd1] transition-colors"
              >
                View all
              </Link>
            </div>
            <div className="mt-4">
              {recentSubmissions.length ? (
                <div className="divide-y divide-[#f4f4f5]">
                  {recentSubmissions.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/dashboard/submissions/${sub.id}`}
                      className="block px-6 py-3.5 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Circle
                            className={`h-2 w-2 shrink-0 fill-current ${
                              sub.spamStatus === "CLEAN" ? "text-[#16a34a]" : "text-[#f59e0b]"
                            }`}
                          />
                          <p className="text-sm font-semibold text-[#09090b] truncate">
                            {sub.submitterName ?? "Unknown sender"}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#f4f4f5] px-2 py-0.5 text-[10px] font-medium text-[#71717a]">
                          {sub.form.formName}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-[#71717a] line-clamp-2 pl-[18px]">
                        {sub.messagePreview ?? "Submission received."}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-10 text-center">
                  <p className="text-sm text-[#a1a1aa]">No messages yet</p>
                  <p className="text-xs text-[#d4d4d8] mt-1">Connect a form and send a test message</p>
                  <Link
                    href="/dashboard/forms"
                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0098f2] hover:text-[#007dd1]"
                  >
                    Go to forms <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
