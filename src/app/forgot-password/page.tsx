import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1200px] items-center px-6 py-12 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Password reset</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
            Recover access to your workspace.
          </h1>
        </section>
        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <AuthForm
            action={requestPasswordResetAction}
            submitLabel="Request reset link"
            fields={[{ name: "email", label: "Email", type: "email", autoComplete: "email" }]}
          />
          <p className="mt-5 text-sm text-charcoal-whisper">
            Back to{" "}
            <Link href="/login" className="font-medium text-midnight-ink">
              log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
