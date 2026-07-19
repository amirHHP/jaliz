export type UserRole = "admin" | "user"

/** Public user shape exposed to the UI. Never contains password material. */
export interface User {
  id: string
  email: string
  fullName: string
  role: UserRole
  isActive: boolean
  createdAt: string | Date
  /**
   * Optional phone number (free-form). Used by the marketplace to expose
   * `tel:` and WhatsApp deep-links on a listing.
   */
  phone?: string | null
  /** Base64 profile photo data URL */
  avatar?: string | null
}

/** Mutable fields a user is allowed to update on their own profile. */
export type UserProfilePatch = {
  fullName?: string
  phone?: string
  avatar?: string | null
}

/** Internal user shape persisted to storage. Includes credential material. */
export interface StoredUser extends User {
  passwordHash?: string | null
  salt?: string | null
  otpCode?: string | null
  otpExpiresAt?: string | null
}

export interface RegisterInput {
  email: string
  fullName: string
  password?: string
}

export interface AdminCreateUserInput extends RegisterInput {
  role?: UserRole
  isActive?: boolean
  avatar?: string | null
}

export interface AdminUpdateUserInput {
  email?: string
  fullName?: string
  password?: string
  role?: UserRole
  isActive?: boolean
  avatar?: string | null
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
  | "OTP_SEND_FAILED"
  | "GENERIC"

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
 * Implementations may be swapped without changing any UI code that depends on it.
 */
export interface IAuthService {
  init(): Promise<void>
  getCurrentUser(): User | null
  getUser(id: string): User | undefined
  register(input: RegisterInput): Promise<User>
  login(email: string, password: string): Promise<User>
  logout(): void
  listUsers(): User[]
  createUser(input: AdminCreateUserInput): Promise<User>
  updateUser(id: string, patch: AdminUpdateUserInput): Promise<User>
  updateUserRole(id: string, role: UserRole): User
  setUserActive(id: string, isActive: boolean): User
  deleteUser(id: string): void
  resetPassword(id: string, newPassword: string): Promise<void>
  /** Let the signed-in user set or change their own password. */
  setMyPassword(newPassword: string): Promise<void>
  /** Update mutable profile fields on a user. */
  updateProfile(id: string, patch: UserProfilePatch): User
  sendOtp(email: string): Promise<{ success: boolean }>
  loginWithOtp(email: string, code: string): Promise<User>
}
