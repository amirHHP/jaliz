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
} from "@/app/actions/auth"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isAdmin: boolean
  revision: number
  users: User[]
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
  listUsers: () => User[]
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [users, setUsers] = useState<User[]>([])
  const [revision, setRevision] = useState(0)
  const bump = useCallback(() => setRevision((n) => n + 1), [])

  useEffect(() => {
    let cancelled = false
    getCurrentUser().then((u) => {
      if (cancelled) return
      if (u) {
        setUser(u)
        setStatus("authenticated")
      } else {
        setUser(null)
        setStatus("unauthenticated")
      }
    }).catch(() => {
      if (!cancelled) setStatus("unauthenticated")
    })
    return () => {
      cancelled = true
    }
  }, [])

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const u = unwrapAuthResult(await registerAction(input))
    setUser(u)
    setStatus("authenticated")
    return u
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const u = unwrapAuthResult(await loginAction(email, password))
    setUser(u)
    setStatus("authenticated")
    return u
  }, [])

  const logout = useCallback(async () => {
    await logoutAction()
    setUser(null)
    setStatus("unauthenticated")
  }, [])

  const updateMyProfile = useCallback(async (patch: UserProfilePatch): Promise<User> => {
    const u = unwrapAuthResult(await updateMyProfileAction(patch))
    setUser(u)
    bump()
    return u
  }, [bump])

  const getUser = useCallback((id: string): User | undefined => {
    return users.find((u) => u.id === id)
  }, [users])

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
    if (user?.id === id) setUser(updated)
    bump()
    return updated
  }, [user, bump])

  const updateUserRole = useCallback(async (id: string, role: UserRole): Promise<User> => {
    const updated = unwrapAuthResult(await updateUserRoleAction(id, role))
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id) setUser(updated)
    bump()
    return updated
  }, [user, bump])

  const setUserActive = useCallback(async (id: string, isActive: boolean): Promise<User> => {
    const updated = unwrapAuthResult(await setUserActiveAction(id, isActive))
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id && !isActive) {
      setUser(null)
      setStatus("unauthenticated")
    } else if (user?.id === id) {
      setUser(updated)
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
    }
    bump()
  }, [user, bump])

  const resetPassword = useCallback(async (id: string, newPassword: string): Promise<void> => {
    unwrapAuthResult(await resetPasswordAction(id, newPassword))
    bump()
  }, [bump])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: user?.role === "admin",
      revision,
      users,
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
    }),
    [status, user, revision, users, refreshUsers, register, login, logout, updateMyProfile, getUser, listUsers, createUser, updateUser, updateUserRole, setUserActive, deleteUser, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
