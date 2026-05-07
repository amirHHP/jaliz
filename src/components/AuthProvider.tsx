"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import {
  IAuthService,
  LocalAuthService,
  RegisterInput,
  User,
  UserRole,
} from "@/lib/auth"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isAdmin: boolean
  /**
   * Monotonically increasing counter that ticks whenever an admin operation
   * mutates the user list. Consumers that derive data from `listUsers()`
   * should include this in their memoization dependencies so they recompute
   * after mutations.
   */
  revision: number
  // Auth flows
  register: (input: RegisterInput) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  // Admin operations (callers should already be admin; service only enforces
  // shape, the UI gates these behind /admin which checks `isAdmin`).
  listUsers: () => User[]
  updateUserRole: (id: string, role: UserRole) => User
  setUserActive: (id: string, isActive: boolean) => User
  deleteUser: (id: string) => void
  resetPassword: (id: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
  /**
   * Optional service override. The default is `LocalAuthService` (browser
   * localStorage). Tests / future Supabase integration can pass another
   * implementation of `IAuthService`.
   */
  service?: IAuthService
}

export function AuthProvider({ children, service }: AuthProviderProps) {
  // We hold the service in a ref so identity is stable across re-renders.
  const serviceRef = useRef<IAuthService | null>(null)
  if (serviceRef.current === null) {
    serviceRef.current = service ?? new LocalAuthService()
  }

  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")

  // Bump this counter to force a re-render when admin operations mutate the
  // user list. Components that call `listUsers()` should include `revision`
  // in their memo deps so they recompute their derived data.
  const [revision, setRevision] = useState(0)
  const bump = useCallback(() => setRevision((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    const svc = serviceRef.current!

    svc
      .init()
      .then(() => {
        if (cancelled) return
        const current = svc.getCurrentUser()
        setUser(current)
        setStatus(current ? "authenticated" : "unauthenticated")
      })
      .catch((err) => {
        // Initialization failure is unexpected; surface it but don't trap
        // the UI in "loading".
        console.error("Auth init failed", err)
        if (!cancelled) setStatus("unauthenticated")
      })

    return () => {
      cancelled = true
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const svc = serviceRef.current!
    const created = await svc.register(input)
    // Auto-login newly registered users for a friendlier UX.
    const signed = await svc.login(input.email, input.password)
    setUser(signed)
    setStatus("authenticated")
    return created
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const svc = serviceRef.current!
    const signed = await svc.login(email, password)
    setUser(signed)
    setStatus("authenticated")
    return signed
  }, [])

  const logout = useCallback(() => {
    serviceRef.current!.logout()
    setUser(null)
    setStatus("unauthenticated")
  }, [])

  const listUsers = useCallback(() => serviceRef.current!.listUsers(), [])

  const updateUserRole = useCallback(
    (id: string, role: UserRole) => {
      const updated = serviceRef.current!.updateUserRole(id, role)
      if (updated.id === user?.id) setUser(updated)
      bump()
      return updated
    },
    [bump, user?.id],
  )

  const setUserActive = useCallback(
    (id: string, isActive: boolean) => {
      const updated = serviceRef.current!.setUserActive(id, isActive)
      if (updated.id === user?.id) {
        // Service may have logged us out if we self-deactivated.
        const cur = serviceRef.current!.getCurrentUser()
        if (!cur) {
          setUser(null)
          setStatus("unauthenticated")
        } else {
          setUser(updated)
        }
      }
      bump()
      return updated
    },
    [bump, user?.id],
  )

  const deleteUser = useCallback(
    (id: string) => {
      serviceRef.current!.deleteUser(id)
      if (user?.id === id) {
        setUser(null)
        setStatus("unauthenticated")
      }
      bump()
    },
    [bump, user?.id],
  )

  const resetPassword = useCallback(
    async (id: string, newPassword: string) => {
      await serviceRef.current!.resetPassword(id, newPassword)
      bump()
    },
    [bump],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: user?.role === "admin",
      revision,
      register,
      login,
      logout,
      listUsers,
      updateUserRole,
      setUserActive,
      deleteUser,
      resetPassword,
    }),
    [
      status,
      user,
      revision,
      register,
      login,
      logout,
      listUsers,
      updateUserRole,
      setUserActive,
      deleteUser,
      resetPassword,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
