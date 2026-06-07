import { createHash, randomBytes } from "node:crypto";

export function createPasswordResetToken() {
  const plainToken = randomBytes(24).toString("hex");
  const tokenHash = createHash("sha256").update(plainToken).digest("hex");

  return {
    plainToken,
    tokenHash,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  };
}

export function hashPasswordResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
