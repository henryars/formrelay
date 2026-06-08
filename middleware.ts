import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseSessionToken } from "@/lib/auth-edge";

const protectedPrefixes = ["/dashboard"];
const authPages = ["/login", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = process.env.SESSION_SECRET ?? "dev-session-secret-change-me";
  const session = await parseSessionToken(request.cookies.get("formrelay_session")?.value, secret);

  if (protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (authPages.includes(pathname) && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup"],
};
