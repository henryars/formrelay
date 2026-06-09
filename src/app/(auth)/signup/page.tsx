import Link from "next/link";
import { redirect } from "next/navigation";
import { Clock, CreditCard, Shield } from "lucide-react";

import { signUpAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard/onboarding");

  return (
    <div className="w-full max-w-sm space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-black text-[#09090b]">Create your account</h1>
        <p className="text-sm text-[#71717a] mt-1.5">
          Start free — your first form works in minutes.
        </p>
      </div>

      <div
        className="rounded-[28px] border border-[#ececee] bg-white p-6"
        style={{ boxShadow: "rgba(0,0,0,0.06) 0px 8px 32px 0px" }}
      >
        <AuthForm
          action={signUpAction}
          submitLabel="Create account"
          fields={[
            { name: "fullName", label: "Full name", autoComplete: "name" },
            { name: "email", label: "Email", type: "email", autoComplete: "email" },
            { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
          ]}
        />
        <p className="mt-4 text-center text-sm text-[#71717a]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[#09090b] hover:text-[#0098f2] transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        {[
          { icon: CreditCard, label: "No credit card needed" },
          { icon: Shield,      label: "Free plan forever" },
          { icon: Clock,       label: "Ready in 2 minutes" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-[#ececee] bg-white px-3 py-1.5 text-xs font-medium text-[#52525b]"
          >
            <Icon className="h-3.5 w-3.5 text-[#a1a1aa]" />
            {label}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-[#a1a1aa]">
        By creating an account you agree to our{" "}
        <Link href="#" className="underline hover:text-[#52525b]">terms of service</Link>.
      </p>
    </div>
  );
}
