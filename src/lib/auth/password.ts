/**
 * Password hashing utilities backed by the WebCrypto SubtleCrypto API.
 *
 * NOTE: SHA-256 with a per-user random salt is *adequate* for a client-side
 * MVP demo where the password store never leaves the browser. For any
 * production / server-stored credential, swap this implementation for a slow
 * KDF such as Argon2id or bcrypt running on the server. The IAuthService
 * abstraction lets us do that without touching the UI.
 */

import crypto from "node:crypto"

const SUBTLE_ALGORITHM = "SHA-256"
const SALT_BYTE_LENGTH = 16

function getSubtleCrypto(): SubtleCrypto {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle
  }
  if (crypto && crypto.webcrypto?.subtle) {
    return crypto.webcrypto.subtle as SubtleCrypto
  }
  throw new Error("WebCrypto SubtleCrypto API is not available in this environment")
}

function bytesToHex(bytes: Uint8Array): string {
  let out = ""
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0")
  }
  return out
}

/** Generate a fresh, cryptographically random salt as a hex string. */
export function generateSalt(byteLength: number = SALT_BYTE_LENGTH): string {
  const bytes = new Uint8Array(byteLength)
  if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes)
  } else if (crypto && crypto.webcrypto?.getRandomValues) {
    crypto.webcrypto.getRandomValues(bytes)
  } else {
    return crypto.randomBytes(byteLength).toString("hex")
  }
  return bytesToHex(bytes)
}

/**
 * Hash `password` with the given `salt`. The salt is prefixed so an attacker
 * with two equal-password users still sees different hashes.
 */
export async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof password !== "string" || password.length === 0) {
    throw new Error("password must be a non-empty string")
  }
  if (typeof salt !== "string" || salt.length === 0) {
    throw new Error("salt must be a non-empty string")
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(`${salt}:${password}`)
  const buffer = await getSubtleCrypto().digest(SUBTLE_ALGORITHM, data)
  return bytesToHex(new Uint8Array(buffer))
}

/**
 * Compare two strings without short-circuiting on the first mismatched byte.
 * Mitigates trivial timing leaks even when running fully client side.
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

/** Recompute the hash and compare it to the expected one in constant time. */
export async function verifyPassword(
  password: string,
  salt: string,
  expectedHash: string,
): Promise<boolean> {
  const candidate = await hashPassword(password, salt)
  return constantTimeEqual(candidate, expectedHash)
}
