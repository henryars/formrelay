import Link from "next/link";
import { Globe, FileText, Inbox, ShieldAlert, Plus, ArrowRight, ExternalLink } from "lucide-react";

import { getDashboardData } from "@/lib/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { user, workspace, websites, forms, submissions, spamCount, recentSubmissions } =
    await getDashboardData();

  const stats = [
    { label: "Websites", value: websites.length, icon: Globe, href: "/dashboard/websites", color: "text-blue-600" },
    { label: "Forms", value: forms.length, icon: FileText, href: "/dashboard/forms", color: "text-violet-600" },
    { label: "Submissions", value: submissions, icon: Inbox, href: "/dashboard/submissions", color: "text-green-600" },
    { label: "Spam blocked", value: spamCount, icon: ShieldAlert, href: "/dashboard/spam", color: "text-amber-600" },
  ];

  const hasWebsites = websites.length > 0;
  const hasForms = forms.length > 0;

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-8">
      <PageHeader
        title={`Welcome back, ${user.fullName.split(" ")[0]}`}
        description={`${workspace.workspaceName} · manage all your form endpoints in one place`}
      >
        <Link href="/dashboard/websites/new">
          <Button size="sm" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add website
          </Button>
        </Link>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.label} href={stat.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-[#71717a] uppercase tracking-wide">{stat.label}</p>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                  <p className="text-3xl font-semibold text-[#09090b]">{stat.value}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Empty state / getting started */}
      {!hasWebsites && (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <Globe className="h-6 w-6 text-[#71717a]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b]">Add your first website</p>
              <p className="text-sm text-[#71717a] mt-1 max-w-xs">
                Start by registering a website. Each website can have multiple form inboxes with unique endpoints.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/websites/new">
                <Button size="sm">Add website</Button>
              </Link>
              <Link href="/dashboard/onboarding">
                <Button size="sm" variant="ghost" className="gap-1">
                  See guide <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {hasWebsites && !hasForms && (
        <Card className="border-dashed border-2 border-[#e4e4e7]">
          <CardContent className="py-12 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[#f4f4f5] flex items-center justify-center">
              <FileText className="h-6 w-6 text-[#71717a]" />
            </div>
            <div>
              <p className="font-semibold text-[#09090b]">Create a form inbox</p>
              <p className="text-sm text-[#71717a] mt-1 max-w-xs">
                Each form inbox generates a unique endpoint URL you paste into your HTML form&apos;s <code className="text-xs bg-[#f4f4f5] px-1 py-0.5 rounded">action</code> attribute.
              </p>
            </div>
            <Link href="/dashboard/forms/new">
              <Button size="sm">Create form inbox</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Main content — websites and recent submissions */}
      {hasWebsites && (
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          {/* Websites */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Websites</CardTitle>
                <Link href="/dashboard/websites/new">
                  <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs">
                    <Plus className="h-3 w-3" /> Add
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-[#f4f4f5]">
                {websites.map((website) => (
                  <Link
                    key={website.id}
                    href={`/dashboard/websites/${website.id}`}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-[#fafafa] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[#09090b] truncate">{website.websiteName}</p>
                      <p className="text-xs text-[#a1a1aa] truncate">{website.websiteUrl}</p>
                    </div>
                    <div className="flex items-center gap-4 ml-4 shrink-0">
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[#09090b]">{website.forms.length}</p>
                        <p className="text-xs text-[#a1a1aa]">forms</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-semibold text-[#09090b]">{website._count.submissions}</p>
                        <p className="text-xs text-[#a1a1aa]">subs</p>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-[#a1a1aa]" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent submissions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent submissions</CardTitle>
                <Link href="/dashboard/submissions">
                  <Button variant="ghost" size="sm" className="h-7 text-xs">View all</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentSubmissions.length ? (
                <div className="divide-y divide-[#f4f4f5]">
                  {recentSubmissions.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/dashboard/submissions/${sub.id}`}
                      className="block px-6 py-3.5 hover:bg-[#fafafa] transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-[#09090b] truncate">
                          {sub.submitterName ?? "Unknown sender"}
                        </p>
                        <Badge variant="secondary" className="shrink-0 text-[10px]">{sub.form.formName}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-[#71717a] line-clamp-2">
                        {sub.messagePreview ?? "Submission received."}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-sm text-[#a1a1aa]">No submissions yet</p>
                  <p className="text-xs text-[#c4c4c7] mt-1">Connect a form to start receiving them</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
