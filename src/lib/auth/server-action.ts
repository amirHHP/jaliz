import type { User as PrismaUser } from "@prisma/client"

import { AuthError, AuthErrorCode, User, UserRole } from "./types"

/** Serializable auth failure returned from server actions (production-safe). */
export type AuthActionError = { __authError: AuthErrorCode }

export type AuthActionResult<T> = T | AuthActionError

export function isAuthActionError<T>(value: AuthActionResult<T>): value is AuthActionError {
  return typeof value === "object" && value !== null && "__authError" in value
}

/** Re-throw as AuthError on the client so existing UI error handling keeps working. */
export function unwrapAuthResult<T>(result: AuthActionResult<T>): T {
  if (isAuthActionError(result)) {
    throw new AuthError(result.__authError)
  }
  return result
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err)
}

function isReadonlyDatabaseError(err: unknown): boolean {
  const message = errorMessage(err)
  return message.includes("readonly database") || message.includes("read-only database")
}

function isPrismaClientError(err: unknown): boolean {
  if (typeof err !== "object" || err === null || !("name" in err)) return false
  const name = (err as { name: string }).name
  return name.startsWith("Prisma")
}

function isDatabaseError(err: unknown): boolean {
  if (isPrismaClientError(err) || isReadonlyDatabaseError(err)) return true
  const message = errorMessage(err).toLowerCase()
  return (
    message.includes("libsql") ||
    message.includes("sqlite") ||
    message.includes("database") ||
    message.includes("turso")
  )
}

function isEmailDeliveryError(err: unknown): boolean {
  const message = errorMessage(err).toLowerCase()
  return (
    message.includes("resend") ||
    message.includes("email") ||
    message.includes("smtp")
  )
}

export async function runAuthAction<T>(fn: () => Promise<T>): Promise<AuthActionResult<T>> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof AuthError) {
      return { __authError: err.code }
    }
    console.error("Auth action error:", err)
    if (isEmailDeliveryError(err)) {
      return { __authError: "OTP_SEND_FAILED" }
    }
    if (isDatabaseError(err)) {
      return { __authError: "GENERIC" }
    }
    return { __authError: "GENERIC" }
  }
}

export function toPublicUser(user: PrismaUser): User {
  const { passwordHash, salt, otpCode, otpExpiresAt, ...publicUser } = user
  void passwordHash
  void salt
  void otpCode
  void otpExpiresAt
  return {
    ...publicUser,
    role: publicUser.role as UserRole,
    createdAt: publicUser.createdAt.toISOString(),
    subscriptionExpiresAt: publicUser.subscriptionExpiresAt
      ? publicUser.subscriptionExpiresAt.toISOString()
      : null,
  }
}
