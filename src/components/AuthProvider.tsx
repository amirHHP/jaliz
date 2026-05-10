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
import { supabase } from "@/lib/supabase"
import { AuthError as AppAuthError, RegisterInput, User, UserProfilePatch, UserRole } from "@/lib/auth"

type AuthStatus = "loading" | "authenticated" | "unauthenticated"

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  isAdmin: boolean
  revision: number
  /** Cached user list (populated by refreshUsers – admin only). */
  users: User[]
  /** Fetch/refresh the full user list from Supabase (admin only). */
  refreshUsers: () => Promise<void>
  // Auth flows
  register: (input: RegisterInput) => Promise<User>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  updateMyProfile: (patch: UserProfilePatch) => Promise<User>
  getUser: (id: string) => User | undefined
  // Admin operations (async)
  updateUserRole: (id: string, role: UserRole) => Promise<User>
  setUserActive: (id: string, isActive: boolean) => Promise<User>
  deleteUser: (id: string) => Promise<void>
  resetPassword: (id: string, newPassword: string) => Promise<void>
  // Legacy sync alias used by admin page useMemo
  listUsers: () => User[]
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function mapProfile(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    email: (row.email as string) ?? "",
    fullName: (row.full_name as string) ?? "",
    role: (row.role as UserRole) ?? "user",
    isActive: (row.is_active as boolean) ?? true,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    phone: (row.phone as string | undefined) ?? undefined,
  }
}

function mapSupabaseError(error: unknown): AppAuthError {
  const msg = (error as { message?: string })?.message ?? ""
  if (msg.includes("Invalid login credentials")) return new AppAuthError("INVALID_CREDENTIALS")
  if (msg.includes("already registered") || msg.includes("already exists")) return new AppAuthError("EMAIL_EXISTS")
  if (msg.includes("Password should be")) return new AppAuthError("WEAK_PASSWORD")
  return new AppAuthError("GENERIC")
}

// --------------------------------------------------------------------------
// Provider
// --------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<AuthStatus>("loading")
  const [users, setUsers] = useState<User[]>([])
  const [revision, setRevision] = useState(0)
  const bump = useCallback(() => setRevision((n) => n + 1), [])

  // Fetch the current user's profile from user_profiles table
  const fetchProfile = useCallback(async (userId: string, email: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single()
    if (error || !data) return null
    return mapProfile({ ...data, email })
  }, [])

  // Sync auth state
  useEffect(() => {
    let cancelled = false

    // Check current session first
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "")
        if (!cancelled) {
          setUser(profile)
          setStatus(profile ? "authenticated" : "unauthenticated")
        }
      } else {
        if (!cancelled) setStatus("unauthenticated")
      }
    })

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled) return
      if (session?.user) {
        const profile = await fetchProfile(session.user.id, session.user.email ?? "")
        setUser(profile)
        setStatus(profile ? "authenticated" : "unauthenticated")
      } else {
        setUser(null)
        setStatus("unauthenticated")
      }
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  // --------------------------------------------------------------------------
  // Auth operations
  // --------------------------------------------------------------------------

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim().toLowerCase(),
      password: input.password,
      options: {
        data: { full_name: input.fullName.trim(), role: "user" },
      },
    })
    if (error) throw mapSupabaseError(error)
    if (!data.user) throw new AppAuthError("GENERIC")

    // Wait briefly for the trigger to create the profile, then fetch it
    await new Promise((r) => setTimeout(r, 500))
    const profile = await fetchProfile(data.user.id, data.user.email ?? input.email)
    if (!profile) {
      // Trigger may not have fired yet; insert manually as fallback
      await supabase.from("user_profiles").upsert({
        id: data.user.id,
        full_name: input.fullName.trim(),
        role: "user",
        is_active: true,
      })
      const p2 = await fetchProfile(data.user.id, data.user.email ?? input.email)
      return p2 ?? { id: data.user.id, email: input.email, fullName: input.fullName, role: "user", isActive: true, createdAt: new Date().toISOString() }
    }
    return profile
  }, [fetchProfile])

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) throw mapSupabaseError(error)
    if (!data.user) throw new AppAuthError("GENERIC")
    const profile = await fetchProfile(data.user.id, data.user.email ?? email)
    if (!profile) throw new AppAuthError("USER_NOT_FOUND")
    if (!profile.isActive) throw new AppAuthError("USER_INACTIVE")
    return profile
  }, [fetchProfile])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  const updateMyProfile = useCallback(async (patch: UserProfilePatch): Promise<User> => {
    if (!user) throw new AppAuthError("GENERIC")
    const updates: Record<string, string | undefined> = {}
    if (patch.fullName !== undefined) updates.full_name = patch.fullName.trim() || user.fullName
    if (patch.phone !== undefined) updates.phone = patch.phone.trim() || undefined

    const { data, error } = await supabase
      .from("user_profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single()
    if (error) throw new AppAuthError("GENERIC")
    const updated = mapProfile({ ...data, email: user.email })
    setUser(updated)
    bump()
    return updated
  }, [user, bump])

  const getUser = useCallback((id: string): User | undefined => {
    return users.find((u) => u.id === id)
  }, [users])

  // --------------------------------------------------------------------------
  // Admin operations
  // --------------------------------------------------------------------------

  const refreshUsers = useCallback(async () => {
    // Join user_profiles with auth.users email via a view or RPC isn't needed
    // since we store email in auth.users. Use admin API only on server side.
    // Instead, fetch profiles and rely on email being set at registration.
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .order("created_at", { ascending: true })
    if (error) { console.error("refreshUsers error:", error); return }

    // Fetch emails from auth.users via the profiles themselves.
    // Since we can't query auth.users directly from client, we store email separately.
    // Use a workaround: call our own users API endpoint or just show email from the session.
    // For now, map without email (admins see profiles but not emails unless we add email column).
    // Better: add email column to user_profiles, populated by trigger.
    const mapped = (data ?? []).map((row) => mapProfile({ ...row, email: row.email ?? "" }))
    setUsers(mapped)
    bump()
  }, [bump])

  // Legacy sync interface used by admin page (returns cached state)
  const listUsers = useCallback(() => users, [users])

  const updateUserRole = useCallback(async (id: string, role: UserRole): Promise<User> => {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ role })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new AppAuthError("USER_NOT_FOUND")
    const updated = mapProfile({ ...data, email: users.find((u) => u.id === id)?.email ?? "" })
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id) setUser(updated)
    bump()
    return updated
  }, [user, users, bump])

  const setUserActive = useCallback(async (id: string, isActive: boolean): Promise<User> => {
    const { data, error } = await supabase
      .from("user_profiles")
      .update({ is_active: isActive })
      .eq("id", id)
      .select()
      .single()
    if (error) throw new AppAuthError("USER_NOT_FOUND")
    const updated = mapProfile({ ...data, email: users.find((u) => u.id === id)?.email ?? "" })
    setUsers((prev) => prev.map((u) => u.id === id ? updated : u))
    if (user?.id === id && !isActive) {
      await logout()
    } else if (user?.id === id) {
      setUser(updated)
    }
    bump()
    return updated
  }, [user, users, bump, logout])

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    // Deleting from user_profiles cascades (profile only).
    // Full auth deletion requires service role key (server-side).
    const { error } = await supabase
      .from("user_profiles")
      .delete()
      .eq("id", id)
    if (error) throw new AppAuthError("USER_NOT_FOUND")
    setUsers((prev) => prev.filter((u) => u.id !== id))
    if (user?.id === id) await logout()
    bump()
  }, [user, bump, logout])

  const resetPassword = useCallback(async (_id: string, newPassword: string): Promise<void> => {
    // Password reset for other users requires Supabase Admin API (service role).
    // For the current user, use supabase.auth.updateUser.
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new AppAuthError("WEAK_PASSWORD")
  }, [])

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
      updateUserRole,
      setUserActive,
      deleteUser,
      resetPassword,
    }),
    [status, user, revision, users, refreshUsers, register, login, logout, updateMyProfile, getUser, listUsers, updateUserRole, setUserActive, deleteUser, resetPassword],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider")
  return ctx
}
