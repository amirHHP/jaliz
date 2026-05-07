export type UserRole = "admin" | "user"

/** Public user shape exposed to the UI. Never contains password material. */
export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

/** Internal user shape persisted to storage. Includes credential material. */
export interface StoredUser extends User {
  passwordHash: string
  salt: string
}

export interface RegisterInput {
  email: string
  fullName: string
  password: string
}

export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_EXISTS"
  | "USER_INACTIVE"
  | "USER_NOT_FOUND"
  | "WEAK_PASSWORD"
  | "INVALID_EMAIL"
  | "EMPTY_FIELD"
  | "FORBIDDEN"

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code)
    this.code = code
    this.name = "AuthError"
  }
}

/**
 * Service contract for authentication and user management.
 *
 * Implementations may be swapped (e.g. swap LocalAuthService for a
 * SupabaseAuthService) without changing any UI code that depends on it.
 */
export interface IAuthService {
  init(): Promise<void>
  getCurrentUser(): User | null
  register(input: RegisterInput): Promise<User>
  login(email: string, password: string): Promise<User>
  logout(): void
  listUsers(): User[]
  updateUserRole(id: string, role: UserRole): User
  setUserActive(id: string, isActive: boolean): User
  deleteUser(id: string): void
  resetPassword(id: string, newPassword: string): Promise<void>
}
