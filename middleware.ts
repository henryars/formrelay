import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { parseSessionToken } from "@/lib/auth";

const protectedPrefixes = ["/dashboard"];
const authPages = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSessionToken(request.cookies.get("formrelay_session")?.value);

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
