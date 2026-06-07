import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/actions/auth";
import { AuthForm } from "@/components/auth-form";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1200px] items-center px-6 py-12 md:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <p className="text-sm font-medium text-invoice-blue">Start free</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-midnight-ink">
            Create your first workspace in a minute.
          </h1>
          <p className="mt-4 text-base leading-8 text-charcoal-whisper">
            We’ll create your account and a default workspace, then you can add the first client
            site and form inbox right away.
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-subtle">
          <AuthForm
            action={signUpAction}
            submitLabel="Create account"
            fields={[
              { name: "fullName", label: "Full name", autoComplete: "name" },
              { name: "email", label: "Email", type: "email", autoComplete: "email" },
              {
                name: "password",
                label: "Password",
                type: "password",
                autoComplete: "new-password",
              },
            ]}
          />
          <p className="mt-5 text-sm text-charcoal-whisper">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-midnight-ink">
              Log in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
