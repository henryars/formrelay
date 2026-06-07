import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { serializeSession } from "@/lib/auth";
import { middleware } from "../middleware";

describe("middleware", () => {
  it("redirects anonymous users away from dashboard routes", () => {
    const request = new NextRequest("http://localhost:3000/dashboard");
    const response = middleware(request);

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("redirects authenticated users away from auth pages", () => {
    const token = serializeSession({
      userId: "user_123",
      email: "demo@example.com",
      issuedAt: 1234,
    });
    const request = new NextRequest("http://localhost:3000/login", {
      headers: {
        cookie: `formrelay_session=${token}`,
      },
    });
    const response = middleware(request);

    expect(response.status).toBeGreaterThanOrEqual(300);
    expect(response.headers.get("location")).toContain("/dashboard");
  });
});
