import Link from "next/link";
import { redirect } from "next/navigation";

import { logInAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[#09090b]">Welcome back</h1>
        <p className="text-sm text-[#71717a] mt-1.5">Sign in to your FormRelay account</p>
      </div>

      <div
        className="rounded-[28px] border border-[#ececee] bg-white p-6"
        style={{ boxShadow: "rgba(0,0,0,0.06) 0px 8px 32px 0px" }}
      >
        <AuthForm
          action={logInAction}
          submitLabel="Sign in"
          fields={[
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
          ]}
        />
        <div className="mt-4 flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="text-[#71717a] hover:text-[#09090b] transition-colors">
            Forgot password?
          </Link>
          <Link href="/signup" className="font-semibold text-[#09090b] hover:text-[#0098f2] transition-colors">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}
