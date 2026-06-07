import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[#09090b]">Reset your password</h1>
        <p className="text-sm text-[#71717a] mt-1">We&apos;ll email you a reset link.</p>
      </div>
      <div className="rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
        <AuthForm
          action={requestPasswordResetAction}
          submitLabel="Send reset link"
          fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
        />
        <p className="mt-4 text-center text-sm text-[#71717a]">
          Remembered it?{" "}
          <Link href="/login" className="text-[#0098f2] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
