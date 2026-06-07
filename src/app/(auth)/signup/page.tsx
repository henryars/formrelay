import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[#09090b]">Create your account</h1>
        <p className="text-sm text-[#71717a] mt-1">
          Start free · no credit card required
        </p>
      </div>

      <div className="rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
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
          <Link href="/login" className="text-[#0098f2] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-[#a1a1aa]">
        By creating an account you agree to our terms of service.
      </p>
    </div>
  );
}
