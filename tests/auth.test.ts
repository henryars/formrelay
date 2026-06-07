import { describe, expect, it } from "vitest";

import { hashPassword, parseSessionToken, serializeSession, verifyPassword } from "@/lib/auth";

describe("auth helpers", () => {
  it("hashes and verifies passwords", () => {
    const hash = hashPassword("super-secret");

    expect(verifyPassword("super-secret", hash)).toBe(true);
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("serializes and parses signed session cookies", () => {
    const token = serializeSession({
      userId: "user_123",
      email: "demo@example.com",
      issuedAt: 1234,
    });

    expect(parseSessionToken(token)).toEqual({
      userId: "user_123",
      email: "demo@example.com",
      issuedAt: 1234,
    });
  });

  it("rejects tampered session cookies", () => {
    const token = serializeSession({
      userId: "user_123",
      email: "demo@example.com",
      issuedAt: 1234,
    });
    const tampered = `${token}oops`;

    expect(parseSessionToken(tampered)).toBeNull();
  });
});
