import { describe, expect, it } from "vitest";

import { createPasswordResetToken, hashPasswordResetToken } from "@/lib/password-reset";

describe("password reset helpers", () => {
  it("creates a plain token, hash, and future expiry", () => {
    const token = createPasswordResetToken();

    expect(token.plainToken).toHaveLength(48);
    expect(token.tokenHash).toHaveLength(64);
    expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("hashes the same token deterministically", () => {
    const token = createPasswordResetToken();

    expect(hashPasswordResetToken(token.plainToken)).toBe(token.tokenHash);
  });
});
