import Link from "next/link";

import { ResetPasswordForm } from "@/components/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;

  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1200px] items-center px-6 py-12 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Reset password</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
            Choose a new password.
          </h1>
        </section>
        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <ResetPasswordForm token={token} />
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
