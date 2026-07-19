import { beforeEach, describe, expect, it } from "vitest"

import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  InMemoryStore,
  LocalAuthService,
} from "../auth-service"
import { AuthError } from "../types"

async function freshService(): Promise<{
  service: LocalAuthService
  store: InMemoryStore
}> {
  const store = new InMemoryStore()
  const service = new LocalAuthService(store)
  await service.init()
  return { service, store }
}

describe("LocalAuthService.init", () => {
  it("seeds a default admin when the store is empty", async () => {
    const { service } = await freshService()
    const users = service.listUsers()
    expect(users).toHaveLength(1)
    expect(users[0].role).toBe("admin")
    expect(users[0].email).toBe(DEFAULT_ADMIN_EMAIL)
  })

  it("does not seed twice across reinitializations", async () => {
    const store = new InMemoryStore()
    const a = new LocalAuthService(store)
    await a.init()

    const b = new LocalAuthService(store)
    await b.init()

    expect(b.listUsers()).toHaveLength(1)
  })

  it("hydrates the current user from a persisted session", async () => {
    const store = new InMemoryStore()
    const a = new LocalAuthService(store)
    await a.init()
    await a.login(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)

    const b = new LocalAuthService(store)
    await b.init()
    expect(b.getCurrentUser()?.email).toBe(DEFAULT_ADMIN_EMAIL)
  })
})

describe("register", () => {
  let service: LocalAuthService
  beforeEach(async () => {
    ;({ service } = await freshService())
  })

  it("creates a regular user with normalized email", async () => {
    const u = await service.register({
      email: "  Alice@Example.COM ",
      fullName: "Alice",
      password: "password123",
    })
    expect(u.email).toBe("alice@example.com")
    expect(u.role).toBe("user")
    expect(u.isActive).toBe(true)
  })

  it("rejects duplicate emails (case-insensitive)", async () => {
    await service.register({
      email: "bob@example.com",
      fullName: "Bob",
      password: "password123",
    })
    await expect(
      service.register({
        email: "BOB@example.com",
        fullName: "Bob 2",
        password: "password123",
      }),
    ).rejects.toMatchObject({ code: "EMAIL_EXISTS" })
  })

  it("rejects malformed emails", async () => {
    await expect(
      service.register({
        email: "not-an-email",
        fullName: "X",
        password: "password123",
      }),
    ).rejects.toMatchObject({ code: "INVALID_EMAIL" })
  })

  it("rejects weak passwords", async () => {
    await expect(
      service.register({
        email: "weak@example.com",
        fullName: "Weak",
        password: "123",
      }),
    ).rejects.toMatchObject({ code: "WEAK_PASSWORD" })
  })

  it("rejects empty required fields", async () => {
    await expect(
      service.register({ email: "", fullName: "", password: "" }),
    ).rejects.toMatchObject({ code: "EMPTY_FIELD" })
  })
})

describe("login", () => {
  it("authenticates a user with the correct password", async () => {
    const { service } = await freshService()
    const u = await service.login(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
    expect(u.email).toBe(DEFAULT_ADMIN_EMAIL)
    expect(service.getCurrentUser()?.id).toBe(u.id)
  })

  it("rejects an incorrect password", async () => {
    const { service } = await freshService()
    await expect(
      service.login(DEFAULT_ADMIN_EMAIL, "wrong-password"),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" })
    expect(service.getCurrentUser()).toBeNull()
  })

  it("rejects an unknown email with the same generic error", async () => {
    const { service } = await freshService()
    await expect(
      service.login("ghost@example.com", "whatever"),
    ).rejects.toMatchObject({ code: "INVALID_CREDENTIALS" })
  })

  it("rejects a deactivated user", async () => {
    const { service } = await freshService()
    const newUser = await service.register({
      email: "u@example.com",
      fullName: "U",
      password: "password123",
    })
    service.setUserActive(newUser.id, false)
    await expect(
      service.login("u@example.com", "password123"),
    ).rejects.toMatchObject({ code: "USER_INACTIVE" })
  })
})

describe("admin operations", () => {
  it("creates a managed user with role and active status", async () => {
    const { service } = await freshService()
    const u = await service.createUser({
      email: " Managed@Example.COM ",
      fullName: "Managed User",
      password: "password123",
      role: "admin",
      isActive: false,
    })

    expect(u.email).toBe("managed@example.com")
    expect(u.role).toBe("admin")
    expect(u.isActive).toBe(false)
  })

  it("updates managed user profile fields without changing password when blank", async () => {
    const { service } = await freshService()
    const u = await service.createUser({
      email: "u@example.com",
      fullName: "User",
      password: "password123",
    })

    const updated = await service.updateUser(u.id, {
      email: "updated@example.com",
      fullName: "Updated User",
      password: "",
      role: "admin",
      isActive: true,
    })

    expect(updated.email).toBe("updated@example.com")
    expect(updated.fullName).toBe("Updated User")
    expect(updated.role).toBe("admin")
    await service.login("updated@example.com", "password123")
  })

  it("updates a managed user's password", async () => {
    const { service } = await freshService()
    const u = await service.createUser({
      email: "u@example.com",
      fullName: "User",
      password: "password123",
    })

    await service.updateUser(u.id, { password: "new-password" })

    await expect(service.login("u@example.com", "password123")).rejects.toThrow()
    const signed = await service.login("u@example.com", "new-password")
    expect(signed.id).toBe(u.id)
  })

  it("rejects duplicate emails during managed user updates", async () => {
    const { service } = await freshService()
    const a = await service.createUser({
      email: "a@example.com",
      fullName: "A",
      password: "password123",
    })
    await service.createUser({
      email: "b@example.com",
      fullName: "B",
      password: "password123",
    })

    await expect(service.updateUser(a.id, { email: "B@example.com" })).rejects.toMatchObject({
      code: "EMAIL_EXISTS",
    })
  })

  it("updates roles", async () => {
    const { service } = await freshService()
    const u = await service.register({
      email: "u@example.com",
      fullName: "U",
      password: "password123",
    })
    const updated = service.updateUserRole(u.id, "admin")
    expect(updated.role).toBe("admin")
    expect(service.listUsers().find((x) => x.id === u.id)?.role).toBe("admin")
  })

  it("deactivating the current user logs them out", async () => {
    const { service } = await freshService()
    const u = await service.register({
      email: "u@example.com",
      fullName: "U",
      password: "password123",
    })
    await service.login("u@example.com", "password123")
    expect(service.getCurrentUser()?.id).toBe(u.id)
    service.setUserActive(u.id, false)
    expect(service.getCurrentUser()).toBeNull()
  })

  it("deletes a user and signs them out if necessary", async () => {
    const { service } = await freshService()
    const u = await service.register({
      email: "u@example.com",
      fullName: "U",
      password: "password123",
    })
    await service.login("u@example.com", "password123")
    service.deleteUser(u.id)
    expect(service.getCurrentUser()).toBeNull()
    expect(service.listUsers().some((x) => x.id === u.id)).toBe(false)
  })

  it("deleting a non-existent user throws", async () => {
    const { service } = await freshService()
    expect(() => service.deleteUser("nope")).toThrow(AuthError)
  })

  it("resets a password and lets the user log in with it", async () => {
    const { service } = await freshService()
    const u = await service.register({
      email: "u@example.com",
      fullName: "U",
      password: "password123",
    })
    await service.resetPassword(u.id, "brand-new-pw")
    await expect(service.login("u@example.com", "password123")).rejects.toThrow()
    const signed = await service.login("u@example.com", "brand-new-pw")
    expect(signed.id).toBe(u.id)
  })

  it("resetPassword rejects a weak password", async () => {
    const { service } = await freshService()
    const u = await service.register({
      email: "u@example.com",
      fullName: "U",
      password: "password123",
    })
    await expect(service.resetPassword(u.id, "abc")).rejects.toMatchObject({
      code: "WEAK_PASSWORD",
    })
  })

  it("setMyPassword lets the signed-in user set a password and log in with it", async () => {
    const { service, store } = await freshService()
    const email = "otp-set-pw@example.com"
    await service.sendOtp(email)
    const users = JSON.parse(store.getItem("jaliz-users") || "[]")
    const code = users.find((u: any) => u.email === email).otpCode
    await service.loginWithOtp(email, code)
    await service.setMyPassword("my-new-password")
    service.logout()
    const signed = await service.login(email, "my-new-password")
    expect(signed.email).toBe(email)
  })

  it("setMyPassword requires a signed-in session", async () => {
    const { service } = await freshService()
    await expect(service.setMyPassword("password123")).rejects.toMatchObject({
      code: "GENERIC",
    })
  })
})
describe("logout", () => {
  it("clears the session from the store", async () => {
    const { service, store } = await freshService()
    await service.login(DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD)
    expect(store.getItem("jaliz-session")).not.toBeNull()
    service.logout()
    expect(store.getItem("jaliz-session")).toBeNull()
    expect(service.getCurrentUser()).toBeNull()
  })
})

describe("OTP passwordless auth", () => {
  it("sends OTP and registers new user with email prefix as fullName", async () => {
    const { service } = await freshService()
    const email = "otp-user@example.com"
    const res = await service.sendOtp(email)
    expect(res.success).toBe(true)

    // User should have been registered in db
    const users = service.listUsers()
    const u = users.find(x => x.email === email)
    expect(u).toBeDefined()
    expect(u?.fullName).toBe("otp-user") // email prefix

    // Attempting login via password should fail
    await expect(service.login(email, "some-password")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS"
    })
  })

  it("authenticates an existing user via OTP", async () => {
    const { service, store } = await freshService()
    const email = "existing@example.com"

    // Create user first
    await service.register({
      email,
      fullName: "Existing User",
      password: "password123"
    })

    // Send OTP
    await service.sendOtp(email)

    // Retrieve stored user to get mock OTP code
    const raw = store.getItem("jaliz-users")
    const users = JSON.parse(raw || "[]")
    const storedUser = users.find((x: any) => x.email === email)
    const code = storedUser.otpCode
    expect(code).toBeDefined()

    // Sign in with correct OTP
    const signed = await service.loginWithOtp(email, code)
    expect(signed.email).toBe(email)
    expect(service.getCurrentUser()?.id).toBe(signed.id)
  })

  it("rejects incorrect or expired OTP", async () => {
    const { service } = await freshService()
    const email = "test-otp@example.com"

    await service.sendOtp(email)

    // Incorrect code
    await expect(service.loginWithOtp(email, "000000")).rejects.toMatchObject({
      code: "INVALID_CREDENTIALS"
    })
  })
})
