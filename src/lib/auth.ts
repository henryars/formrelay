import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { env } from "@/lib/env";
import { SESSION_COOKIE, parseSessionToken, type SessionPayload } from "@/lib/auth-edge";
import { prisma } from "@/lib/prisma";

export { SESSION_COOKIE, parseSessionToken } from "@/lib/auth-edge";

function base64UrlEncode(input: string) {
  return Buffer.from(input).toString("base64url");
}

function signPayload(payload: string) {
  return createHmac("sha256", env.SESSION_SECRET).update(payload).digest("base64url");
}

export function serializeSession(session: SessionPayload) {
  const payload = base64UrlEncode(JSON.stringify(session));
  const signature = signPayload(payload);
  return `${payload}.${signature}`;
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const nextHash = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(nextHash, "hex"));
}

export async function createSession(input: { userId: string; email: string }) {
  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    serializeSession({
      userId: input.userId,
      email: input.email,
      issuedAt: Date.now(),
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    },
  );
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession() {
  const cookieStore = await cookies();
  const rawValue = cookieStore.get(SESSION_COOKIE)?.value;

  return parseSessionToken(rawValue, env.SESSION_SECRET);
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      workspaces: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireWorkspace() {
  const user = await requireUser();
  const workspace = user.workspaces[0];

  if (!workspace) {
    redirect("/signup");
  }

  return { user, workspace };
}
