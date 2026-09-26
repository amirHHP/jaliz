import crypto from "crypto";

/**
 * Session cookie `Secure` flag.
 * In production, Next sets NODE_ENV=production even on plain HTTP (e.g. VM IP:port).
 * Browsers ignore Secure cookies on http://, so login never sticks unless HTTPS is used
 * or COOKIE_SECURE is set to "false".
 */
export function useSecureSessionCookie(): boolean {
  if (process.env.COOKIE_SECURE === "true") return true;
  if (process.env.COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

const DEFAULT_SESSION_SECRET = "jaliz-session-secret-change-in-production-env";

export function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    process.env.AUTH_SECRET ||
    DEFAULT_SESSION_SECRET
  );
}

/**
 * Digitally signs a user ID for the session cookie using HMAC-SHA256.
 * Format: `<userId>.<hexSignature>`
 */
export function signSessionValue(userId: string, secret?: string): string {
  if (!userId || typeof userId !== "string") {
    throw new Error("Invalid userId to sign");
  }
  const key = secret || getSessionSecret();
  const signature = crypto.createHmac("sha256", key).update(userId).digest("hex");
  return `${userId}.${signature}`;
}

/**
 * Validates the HMAC-SHA256 signature of a session cookie and extracts the userId.
 * Returns null if the signature is invalid or tampered with.
 * Unsigned cookies are strictly rejected in production.
 */
export function verifyAndExtractSessionUserId(
  cookieValue: string | null | undefined,
  secret?: string
): string | null {
  if (!cookieValue || typeof cookieValue !== "string") return null;
  const trimmed = cookieValue.trim();
  if (!trimmed || trimmed === ".") return null;

  const dotIndex = cookieValue.lastIndexOf(".");
  if (dotIndex <= 0) {
    return null;
  }

  const userId = cookieValue.slice(0, dotIndex);
  const signature = cookieValue.slice(dotIndex + 1);

  if (!userId || !signature || signature.length !== 64 || !/^[0-9a-fA-F]{64}$/.test(signature)) {
    return null;
  }

  const key = secret || getSessionSecret();
  const expectedSig = crypto.createHmac("sha256", key).update(userId).digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSig, "hex");

    if (sigBuf.length !== expBuf.length || sigBuf.length !== 32) {
      return null;
    }

    if (!crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
