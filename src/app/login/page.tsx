import Link from "next/link";
import { redirect } from "next/navigation";

import { logInAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1200px] items-center px-6 py-12 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Log in</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
            Pick up where your lead flow left off.
          </h1>
          <p className="mt-4 text-base leading-8 text-charcoal-whisper">
            Sign in to manage websites, forms, submissions, and spam settings from one workspace.
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <AuthForm
            action={logInAction}
            submitLabel="Log in"
            fields={[
              { name: "email", label: "Email", type: "email", autoComplete: "email" },
              {
                name: "password",
                label: "Password",
                type: "password",
                autoComplete: "current-password",
              },
            ]}
          />
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-charcoal-whisper">
            <Link href="/forgot-password" className="font-medium text-midnight-ink">
              Forgot password?
            </Link>
          </div>
          <p className="mt-3 text-sm text-charcoal-whisper">
            New here?{" "}
            <Link href="/signup" className="font-medium text-midnight-ink">
              Create an account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
