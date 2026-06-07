import { requireWorkspace } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { CreditCard, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const { user, workspace } = await requireWorkspace();

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-8">
      <PageHeader
        label="Billing"
        title="Plan & billing"
        description="Manage your subscription and usage."
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Current plan</CardTitle>
              <CardDescription className="mt-1">You are on the free plan.</CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {user.plan}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Submissions/mo", value: "500", limit: "500" },
              { label: "Forms", value: "3", limit: "3" },
              { label: "Websites", value: "1", limit: "1" },
              { label: "Email alerts", value: "Included", limit: "" },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-[#fafafa] border border-[#f4f4f5] p-4">
                <p className="text-xs text-[#a1a1aa]">{item.label}</p>
                <p className="text-lg font-semibold text-[#09090b] mt-1">{item.value}</p>
                {item.limit && <p className="text-xs text-[#a1a1aa]">of {item.limit}</p>}
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-dashed border-[#e4e4e7] p-4 text-center">
            <CreditCard className="h-6 w-6 text-[#a1a1aa] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#09090b]">Upgrade coming soon</p>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Paid plans with higher limits and priority support are in development.
            </p>
            <Button variant="outline" size="sm" className="mt-3" disabled>
              Notify me when available
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
