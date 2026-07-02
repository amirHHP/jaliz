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
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: string }).name === "PrismaClientKnownRequestError"
  )
}

export async function runAuthAction<T>(fn: () => Promise<T>): Promise<AuthActionResult<T>> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof AuthError) {
      return { __authError: err.code }
    }
    if (isReadonlyDatabaseError(err) || isPrismaClientError(err)) {
      console.error("Auth action database error:", err)
      return { __authError: "GENERIC" }
    }
    console.error("Unexpected auth action error:", err)
    throw err
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
  }
}
