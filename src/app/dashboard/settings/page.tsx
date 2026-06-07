import { AccountSettingsForm } from "@/components/account-settings-form";
import { requireWorkspace } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, workspace } = await requireWorkspace();

  return (
    <div className="px-8 py-8 max-w-2xl mx-auto space-y-8">
      <PageHeader
        label="Settings"
        title="Account settings"
        description="Manage your profile and workspace details."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile & workspace</CardTitle>
          <CardDescription>Update your name, workspace name, and email address.</CardDescription>
        </CardHeader>
        <CardContent>
          <AccountSettingsForm
            fullName={user.fullName}
            workspaceName={workspace.workspaceName}
            email={user.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
