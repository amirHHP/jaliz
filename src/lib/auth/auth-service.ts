import {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  AuthError,
  IAuthService,
  RegisterInput,
  StoredUser,
  User,
  UserProfilePatch,
  UserRole,
} from "./types"
import { generateSalt, hashPassword, verifyPassword } from "./password"

const USERS_KEY = "jaliz-users"
const SESSION_KEY = "jaliz-session"
const MIN_PASSWORD_LENGTH = 6

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Minimal Storage shape we depend on. Matches the standard `Storage` API
 * (`window.localStorage`) but lets us inject an in-memory store from tests.
 */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export class InMemoryStore implements KeyValueStore {
  private readonly map = new Map<string, string>()

  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null
  }
  setItem(key: string, value: string): void {
    this.map.set(key, value)
  }
  removeItem(key: string): void {
    this.map.delete(key)
  }
}

interface SessionPayload {
  userId: string
}

function generateId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function toPublicUser(user: StoredUser): User {
  // Strip credential material before exposing the user to the UI.
  const { passwordHash: _h, salt: _s, ...rest } = user
  void _h
  void _s
  return rest
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Default, browser-only auth service. Persists users to a `KeyValueStore`
 * (defaults to `localStorage`).
 *
 * Limitations (acceptable for an MVP, but document them so we don't forget):
 *  - Anyone with browser dev-tools can read the user list. Don't use this
 *    for sensitive data.
 *  - Sessions don't expire here. We only persist the user id.
 *  - Password hashing is fast (SHA-256) on purpose, since CPU-bound KDFs
 *    would block the main thread. Replace with a server impl for production.
 */
export class LocalAuthService implements IAuthService {
  private readonly store: KeyValueStore
  private currentUser: User | null = null
  private initialized = false

  constructor(store?: KeyValueStore) {
    if (store) {
      this.store = store
    } else if (typeof window !== "undefined" && window.localStorage) {
      this.store = window.localStorage
    } else {
      this.store = new InMemoryStore()
    }
  }

  async init(): Promise<void> {
    if (this.initialized) return

    await this.seedDefaultAdminIfEmpty()

    const raw = this.store.getItem(SESSION_KEY)
    if (raw) {
      try {
        const session = JSON.parse(raw) as SessionPayload
        const stored = this.findStoredById(session.userId)
        // Drop session if user is gone or has been deactivated.
        if (stored && stored.isActive) {
          this.currentUser = toPublicUser(stored)
        } else {
          this.store.removeItem(SESSION_KEY)
        }
      } catch {
        this.store.removeItem(SESSION_KEY)
      }
    }

    this.initialized = true
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  getUser(id: string): User | undefined {
    const stored = this.findStoredById(id)
    return stored ? toPublicUser(stored) : undefined
  }

  async register(input: RegisterInput): Promise<User> {
    return this.createUserWithRole(input, "user")
  }

  async login(email: string, password: string): Promise<User> {
    const normalized = normalizeEmail(email)
    if (!normalized || !password) {
      throw new AuthError("EMPTY_FIELD")
    }

    const stored = this.findStoredByEmail(normalized)
    if (!stored) {
      throw new AuthError("INVALID_CREDENTIALS")
    }
    if (!stored.isActive) {
      throw new AuthError("USER_INACTIVE")
    }

    const ok = await verifyPassword(password, stored.salt, stored.passwordHash)
    if (!ok) {
      throw new AuthError("INVALID_CREDENTIALS")
    }

    const publicUser = toPublicUser(stored)
    this.currentUser = publicUser
    this.persistSession(publicUser.id)
    return publicUser
  }

  logout(): void {
    this.currentUser = null
    this.store.removeItem(SESSION_KEY)
  }

  listUsers(): User[] {
    return this.readUsers().map(toPublicUser)
  }

  async createUser(input: AdminCreateUserInput): Promise<User> {
    return this.createUserWithRole(input, input.role ?? "user", input.isActive ?? true)
  }

  async updateUser(id: string, patch: AdminUpdateUserInput): Promise<User> {
    const normalizedEmail = patch.email !== undefined ? normalizeEmail(patch.email) : undefined
    const fullName = patch.fullName !== undefined ? patch.fullName.trim() : undefined
    const password = patch.password?.trim()

    if (patch.email !== undefined && !normalizedEmail) throw new AuthError("EMPTY_FIELD")
    if (patch.fullName !== undefined && !fullName) throw new AuthError("EMPTY_FIELD")
    if (normalizedEmail !== undefined && !EMAIL_REGEX.test(normalizedEmail)) {
      throw new AuthError("INVALID_EMAIL")
    }
    if (patch.role !== undefined && patch.role !== "admin" && patch.role !== "user") {
      throw new AuthError("GENERIC")
    }
    if (password !== undefined && password.length > 0 && password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError("WEAK_PASSWORD")
    }

    const users = this.readUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) throw new AuthError("USER_NOT_FOUND")
    if (
      normalizedEmail !== undefined &&
      users.some((u) => u.id !== id && u.email === normalizedEmail)
    ) {
      throw new AuthError("EMAIL_EXISTS")
    }

    const next = { ...users[idx] }
    if (normalizedEmail !== undefined) next.email = normalizedEmail
    if (fullName !== undefined) next.fullName = fullName
    if (patch.role !== undefined) next.role = patch.role
    if (patch.isActive !== undefined) next.isActive = patch.isActive
    if (password) {
      next.salt = generateSalt()
      next.passwordHash = await hashPassword(password, next.salt)
    }

    users[idx] = next
    this.writeUsers(users)
    if (this.currentUser?.id === id) {
      this.currentUser = next.isActive ? toPublicUser(next) : null
    }
    return toPublicUser(next)
  }

  updateUserRole(id: string, role: UserRole): User {
    return this.mutateUser(id, (u) => ({ ...u, role }))
  }

  setUserActive(id: string, isActive: boolean): User {
    const updated = this.mutateUser(id, (u) => ({ ...u, isActive }))
    // If the toggled user is the one currently signed in and we just
    // disabled them, end their session immediately.
    if (!isActive && this.currentUser?.id === id) {
      this.logout()
    }
    return updated
  }

  deleteUser(id: string): void {
    const users = this.readUsers()
    const next = users.filter((u) => u.id !== id)
    if (next.length === users.length) {
      throw new AuthError("USER_NOT_FOUND")
    }
    this.writeUsers(next)
    if (this.currentUser?.id === id) {
      this.logout()
    }
  }

  updateProfile(id: string, patch: UserProfilePatch): User {
    return this.mutateUser(id, (u) => {
      const next = { ...u }
      if (patch.fullName !== undefined) {
        const trimmed = patch.fullName.trim()
        if (trimmed) next.fullName = trimmed
      }
      if (patch.phone !== undefined) {
        const trimmed = patch.phone.trim()
        // Allow clearing the phone by passing an empty string.
        next.phone = trimmed || undefined
      }
      return next
    })
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError("WEAK_PASSWORD")
    }
    const users = this.readUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) {
      throw new AuthError("USER_NOT_FOUND")
    }
    const salt = generateSalt()
    const passwordHash = await hashPassword(newPassword, salt)
    users[idx] = { ...users[idx], salt, passwordHash }
    this.writeUsers(users)
  }

  // ------------------------------------------------------------------
  // Internals
  // ------------------------------------------------------------------

  private async createUserWithRole(
    input: RegisterInput,
    role: UserRole,
    isActive = true,
  ): Promise<User> {
    const email = normalizeEmail(input.email)
    const fullName = input.fullName.trim()
    const password = input.password

    if (!email || !fullName || !password) {
      throw new AuthError("EMPTY_FIELD")
    }
    if (!EMAIL_REGEX.test(email)) {
      throw new AuthError("INVALID_EMAIL")
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AuthError("WEAK_PASSWORD")
    }
    if (this.findStoredByEmail(email)) {
      throw new AuthError("EMAIL_EXISTS")
    }

    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)
    const newUser: StoredUser = {
      id: generateId(),
      email,
      fullName,
      role,
      isActive,
      createdAt: new Date().toISOString(),
      salt,
      passwordHash,
    }

    const users = this.readUsers()
    users.push(newUser)
    this.writeUsers(users)
    return toPublicUser(newUser)
  }

  private mutateUser(id: string, fn: (user: StoredUser) => StoredUser): User {
    const users = this.readUsers()
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) {
      throw new AuthError("USER_NOT_FOUND")
    }
    users[idx] = fn(users[idx])
    this.writeUsers(users)
    if (this.currentUser?.id === id) {
      this.currentUser = toPublicUser(users[idx])
    }
    return toPublicUser(users[idx])
  }

  private async seedDefaultAdminIfEmpty(): Promise<void> {
    const users = this.readUsers()
    if (users.length > 0) return
    // Bootstrap a default admin so the app is usable on first run.
    // Credentials are surfaced on the login page so the user knows them.
    await this.createUserWithRole(
      {
        email: "admin@jaliz.local",
        fullName: "Jaliz Admin",
        password: "admin123",
      },
      "admin",
    )
  }

  private persistSession(userId: string): void {
    const payload: SessionPayload = { userId }
    this.store.setItem(SESSION_KEY, JSON.stringify(payload))
  }

  private readUsers(): StoredUser[] {
    const raw = this.store.getItem(USERS_KEY)
    if (!raw) return []
    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? (parsed as StoredUser[]) : []
    } catch {
      return []
    }
  }

  private writeUsers(users: StoredUser[]): void {
    this.store.setItem(USERS_KEY, JSON.stringify(users))
  }

  private findStoredByEmail(email: string): StoredUser | undefined {
    const target = normalizeEmail(email)
    return this.readUsers().find((u) => u.email === target)
  }

  private findStoredById(id: string): StoredUser | undefined {
    return this.readUsers().find((u) => u.id === id)
  }
}

export const DEFAULT_ADMIN_EMAIL = "admin@jaliz.local"
export const DEFAULT_ADMIN_PASSWORD = "admin123"
