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

export async function runAuthAction<T>(fn: () => Promise<T>): Promise<AuthActionResult<T>> {
  try {
    return await fn()
  } catch (err) {
    if (err instanceof AuthError) {
      return { __authError: err.code }
    }
    console.error("Unexpected auth action error:", err)
    throw err
  }
}

export function toPublicUser(user: PrismaUser): User {
  const { passwordHash, salt, ...publicUser } = user
  void passwordHash
  void salt
  return {
    ...publicUser,
    role: publicUser.role as UserRole,
    createdAt: publicUser.createdAt.toISOString(),
  }
}
