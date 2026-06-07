"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createPasswordResetToken, hashPasswordResetToken } from "@/lib/password-reset";
import {
  clearSession,
  createSession,
  hashPassword,
  requireWorkspace,
  verifyPassword,
} from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

const signUpSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const logInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type AuthFormState = {
  error?: string;
  message?: string;
};

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const accountSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  workspaceName: z.string().min(2, "Workspace name is required"),
});

export async function signUpAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your details",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return {
      error: "An account with this email already exists",
    };
  }

  const user = await prisma.user.create({
    data: {
      fullName: parsed.data.fullName,
      email,
      passwordHash: hashPassword(parsed.data.password),
      workspaces: {
        create: {
          workspaceName: `${parsed.data.fullName.split(" ")[0]}'s Workspace`,
        },
      },
    },
  });

  await createSession({
    userId: user.id,
    email: user.email,
  });

  redirect("/dashboard");
}

export async function logInAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = logInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your login details",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return {
      error: "Incorrect email or password",
    };
  }

  await createSession({
    userId: user.id,
    email: user.email,
  });

  redirect("/dashboard");
}

export async function logOutAction() {
  await clearSession();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please enter a valid email",
    };
  }

  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    const token = createPasswordResetToken();
    const resetUrl = new URL("/reset-password", env.NEXT_PUBLIC_APP_URL);
    resetUrl.searchParams.set("token", token.plainToken);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token.tokenHash,
        passwordResetExpires: token.expiresAt,
      },
    });

    try {
      const emailResult = await sendPasswordResetEmail({
        to: user.email,
        resetUrl: resetUrl.toString(),
        fullName: user.fullName,
      });

      if (emailResult.skipped) {
        console.info(`Password reset email skipped for ${email}: ${resetUrl.toString()}`);
      }
    } catch (error) {
      console.error("Password reset email failed to send", {
        email,
        message: error instanceof Error ? error.message : "Unknown email error",
      });
      console.info(`Password reset for ${email}: ${resetUrl.toString()}`);
    }
  }

  return {
    message: "If that email exists, a reset link has been sent.",
  };
}

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Unable to reset password",
    };
  }

  const hashedToken = hashPasswordResetToken(parsed.data.token);
  const user = await prisma.user.findFirst({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    return {
      error: "This reset link is invalid or has expired",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashPassword(parsed.data.password),
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  return {
    message: "Password reset complete. You can now log in with your new password.",
  };
}

export async function updateAccountSettingsAction(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const { user, workspace } = await requireWorkspace();

  const parsed = accountSchema.safeParse({
    fullName: formData.get("fullName"),
    workspaceName: formData.get("workspaceName"),
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Please check your settings",
    };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      fullName: parsed.data.fullName,
    },
  });

  await prisma.workspace.update({
    where: { id: workspace.id },
    data: {
      workspaceName: parsed.data.workspaceName,
    },
  });

  return {
    message: "Settings saved.",
  };
}
