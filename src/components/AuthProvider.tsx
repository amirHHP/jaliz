"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { unwrapAuthResult } from "@/lib/auth/server-action"
import {
  AdminCreateUserInput,
  AdminUpdateUserInput,
  RegisterInput,
  User,
  UserProfilePatch,
  UserRole,
} from "@/lib/auth/types"
import {
  getCurrentUser,
  registerAction,
  loginAction,
  logoutAction,
  updateMyProfileAction,
  listUsersAction,
  createUserAction,
  updateUserAction,
  updateUserRoleAction,
  setUserActiveAction,
  deleteUserAction,
  resetPasswordAction,
  setMyPasswordAction,
  sendOtpAction,
  loginWithOtpAction,
  grantUsersSubscriptionAction,
  revokeUsersSubscriptionAction,
} from "@/app/actions/auth"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isAdmin: boolean
  revision: number
  users: User[]
  refreshUser: () => Promise<User | null>
  refreshUsers: () => Promise<void>
  register: (input: RegisterInput) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateMyProfile: (patch: UserProfilePatch) => Promise<User>
  getUser: (id: string) => User | undefined
  createUser: (input: AdminCreateUserInput) => Promise<User>
  updateUser: (id: string, patch: AdminUpdateUserInput) => Promise<User>
  updateUserRole: (id: string, role: UserRole) => Promise<User>
  setUserActive: (id: string, isActive: boolean) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  resetPassword: (id: string, newPassword: string) => Promise<void>
  setMyPassword: (newPassword: string) => Promise<void>
  listUsers: () => User[]
  sendOtp: (email: string) => Promise<{ success: boolean }>
  loginWithOtp: (email: string, code: string) => Promise<User>
  grantUsersSubscription: (userIds: string[], durationDays: number, reason?: string) => Promise<void>
  revokeUsersSubscription: (userIds: string[]) => Promise<void>
}

const AUTH_CACHE_KEY = "jaliz_last_auth_user"

function getCachedAuthUser(): User | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(AUTH_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed.id === "string") {
      return parsed as User
    }
  } catch {}
  return null
}

function setCachedAuthUser(u: User | null) {
  if (typeof window === "undefined") return
  try {
    if (u) {
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(u))
    } else {
      localStorage.removeItem(AUTH_CACHE_KEY)
    }
  } catch {}
}

export function hasSessionCookie(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie.split(";").some((c) => {
    const trimmed = c.trim()
    return trimmed.startsWith("jaliz_logged_in=1") || trimmed.startsWith("jaliz_session=")
  })
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => getCachedAuthUser())
  const [status, setStatus] = useState<AuthStatus>(() => {
    const cached = getCachedAuthUser()
    if (cached) return "authenticated"
    return "loading"
  })
  const [users, setUsers] = useState<User[]>([])
  const [revision, setRevision] = useState(0)
  const bump = useCallback(() => setRevision((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    let retryTimer: NodeJS.Timeout | null = null

    // Multi-tab sync: handle logout or profile update from another tab
    const handleStorage = (e: StorageEvent) => {
      if (e.key === AUTH_CACHE_KEY) {
        if (!e.newValue) {
          setUser(null)
          setStatus("unauthenticated")
        } else {
          try {
            const u = JSON.parse(e.newValue)
            if (u && typeof u.id === "string") {
              setUser(u)
              setStatus("authenticated")
            }
          } catch {}
        }
      }
    }
    window.addEventListener("storage", handleStorage)

    const checkAuth = (attempt = 0) => {
      getCurrentUser()
        .then((u) => {
          if (cancelled) return
          if (u) {
            setUser(u)
            setStatus("authenticated")
            setCachedAuthUser(u)
          } else {
            // Server explicitly returned null: session cookie missing or user deleted/inactive
            setUser(null)
            setStatus("unauthenticated")
            setCachedAuthUser(null)
          }
        })
        .catch((err) => {
          if (cancelled) return
          console.warn("[AuthProvider] Auth check error (transient network or db issue):", err)

          const currentCached = getCachedAuthUser()
          const currentHasCookie = hasSessionCookie()

          // If we have either a cached user OR an active session cookie:
          // NEVER downgrade to unauthenticated on network/server errors!
          if (currentCached || currentHasCookie) {
            if (currentCached) {
              setUser(currentCached)
              setStatus("authenticated")
            }
            // Keep retrying in background with backoff (up to 5 attempts)
            if (attempt < 5) {
              const delay = Math.min(10000, (attempt + 1) * 2000)
              retryTimer = setTimeout(() => {
                if (!cancelled) checkAuth(attempt + 1)
              }, delay)
            }
            return
          }

          // Brand new visitor with no cookie and no cached user:
          if (attempt < 2) {
            retryTimer = setTimeout(() => {
              if (!cancelled) checkAuth(attempt + 1)
            }, 2000)
            return
          }

          // Genuinely could not reach server and no existing session exists
          setStatus("unauthenticated")
        })
    }

    checkAuth(0)

    // Re-verify auth when coming back online
    const handleOnline = () => {
      if (!cancelled) checkAuth(0)
    }
    window.addEventListener("online", handleOnline)

    return () => {
      cancelled = true
      if (retryTimer) clearTimeout(retryTimer)
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  // Auto-connect to pending shop if user was invited via a shop link
  useEffect(() => {
    if (status === "authenticated" && user) {
      try {
        const pendingShopCode = localStorage.getItem("pending_shop_code")
        if (pendingShopCode) {
          localStorage.removeItem("pending_shop_code")
          import("@/app/actions/shop").then(({ joinShopAction }) => {
            joinShopAction(pendingShopCode).then(() => {
              getCurrentUser().then((updated) => {
                if (updated) setUser(updated)
              })
            }).catch((err) => {
              console.warn("Failed to join pending shop:", err)
            })
          })
        }
      } catch {}
    }
  }, [status, user])

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const u = unwrapAuthResult(await registerAction(input))
    setUser(u)
    setStatus("authenticated")
    setCachedAuthUser(u)
    return u
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const u = unwrapAuthResult(await loginAction(email, password))
    setUser(u)
    setStatus("authenticated")
    setCachedAuthUser(u)
    return u
  }, [])

  const sendOtp = useCallback(async (email: string): Promise<{ success: boolean }> => {
    return unwrapAuthResult(await sendOtpAction(email))
  }, [])

  const loginWithOtp = useCallback(async (email: string, code: string): Promise<User> => {
    const u = unwrapAuthResult(await loginWithOtpAction(email, code))
    setUser(u)
    setStatus("authenticated")
    setCachedAuthUser(u)
    return u
  }, [])

  const logout = useCallback(async () => {
    setCachedAuthUser(null)
    if (typeof document !== "undefined") {
      document.cookie = "jaliz_logged_in=; path=/; max-age=0"
      document.cookie = "jaliz_session=; path=/; max-age=0"
    }
    await logoutAction()
    setUser(null)
    setStatus("unauthenticated")
  }, [])

  const updateMyProfile = useCallback(async (patch: UserProfilePatch): Promise<User> => {
    const u = unwrapAuthResult(await updateMyProfileAction(patch))
    setUser(u)
    setCachedAuthUser(u)
    bump()
    return u
  }, [bump])

  const getUser = useCallback((id: string): User | undefined => {
    return users.find((u) => u.id === id)
  }, [users])

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const u = await getCurrentUser()
      if (u) {
        setUser(u)
        setStatus("authenticated")
        setCachedAuthUser(u)
      } else {
        setUser(null)
        setStatus("unauthenticated")
        setCachedAuthUser(null)
      }
      return u
    } catch (err) {
      console.error("Failed to refresh current user", err)
      return null
    }
  }, [])

  const refreshUsers = useCallback(async () => {
    if (user?.role !== "admin") return
    try {
      const list = unwrapAuthResult(await listUsersAction())
      setUsers(list)
      bump()
    } catch (err) {
      console.error("Failed to refresh users", err)
    }
  }, [user, bump])

  const listUsers = useCallback(() => users, [users])

  const createUser = useCallback(async (input: AdminCreateUserInput): Promise<User> => {
    const created = unwrapAuthResult(await createUserAction(input))
    setUsers((prev) => [...prev, created])
    bump()
    return created
  }, [bump])

  const updateUser = useCallback(async (id: string, patch: AdminUpdateUserInput): Promise<User> => {
    const updated = unwrapAuthResult(await updateUserAction(id, patch))
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id) {
      setUser(updated)
      setCachedAuthUser(updated)
    }
    bump()
    return updated
  }, [user, bump])

  const updateUserRole = useCallback(async (id: string, role: UserRole): Promise<User> => {
    const updated = unwrapAuthResult(await updateUserRoleAction(id, role))
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id) {
      setUser(updated)
      setCachedAuthUser(updated)
    }
    bump()
    return updated
  }, [user, bump])

  const setUserActive = useCallback(async (id: string, isActive: boolean): Promise<User> => {
    const updated = unwrapAuthResult(await setUserActiveAction(id, isActive))
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id && !isActive) {
      setUser(null)
      setStatus("unauthenticated")
      setCachedAuthUser(null)
    } else if (user?.id === id) {
      setUser(updated)
      setCachedAuthUser(updated)
    }
    bump()
    return updated
  }, [user, bump])

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    unwrapAuthResult(await deleteUserAction(id))
    setUsers((prev) => prev.filter((u) => u.id !== id))
    if (user?.id === id) {
      setUser(null)
      setStatus("unauthenticated")
      setCachedAuthUser(null)
    }
    bump()
  }, [user, bump])

  const resetPassword = useCallback(async (id: string, newPassword: string): Promise<void> => {
    unwrapAuthResult(await resetPasswordAction(id, newPassword))
    bump()
  }, [bump])

  const setMyPassword = useCallback(async (newPassword: string): Promise<void> => {
    unwrapAuthResult(await setMyPasswordAction(newPassword))
  }, [])

  const grantUsersSubscription = useCallback(
    async (userIds: string[], durationDays: number, reason?: string): Promise<void> => {
      unwrapAuthResult(await grantUsersSubscriptionAction(userIds, durationDays, reason))
      await refreshUsers()
      if (user && userIds.includes(user.id)) {
        await refreshUser()
      }
    },
    [user, refreshUsers, refreshUser],
  )

  const revokeUsersSubscription = useCallback(
    async (userIds: string[]): Promise<void> => {
      unwrapAuthResult(await revokeUsersSubscriptionAction(userIds))
      await refreshUsers()
      if (user && userIds.includes(user.id)) {
        await refreshUser()
      }
    },
    [user, refreshUsers, refreshUser],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: user?.role === "admin",
      revision,
      users,
      refreshUser,
      refreshUsers,
      register,
      login,
      logout,
      updateMyProfile,
      getUser,
      listUsers,
      createUser,
      updateUser,
      updateUserRole,
      setUserActive,
      deleteUser,
      resetPassword,
      setMyPassword,
      sendOtp,
      loginWithOtp,
      grantUsersSubscription,
      revokeUsersSubscription,
    }),
    [
      status,
      user,
      revision,
      users,
      refreshUser,
      refreshUsers,
      register,
      login,
      logout,
      updateMyProfile,
      getUser,
      listUsers,
      createUser,
      updateUser,
      updateUserRole,
      setUserActive,
      deleteUser,
      resetPassword,
      setMyPassword,
      sendOtp,
      loginWithOtp,
      grantUsersSubscription,
      revokeUsersSubscription,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
