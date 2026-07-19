"use server";

import { cookies } from "next/headers";
import type { Prisma, User as PrismaUser } from "@prisma/client";
import prisma from "@/lib/prisma";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password";
import { useSecureSessionCookie } from "@/lib/auth/session-cookie";
import {
  AuthActionResult,
  runAuthAction,
  toPublicUser,
} from "@/lib/auth/server-action";
import { AdminCreateUserInput, AdminUpdateUserInput, RegisterInput, AuthError } from "@/lib/auth/types";
import { UserRole } from "@/lib/auth/types";
import { sendOtpEmail } from "@/lib/email/send-otp-email";

const SESSION_KEY = "jaliz_session";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

/** Placeholder credentials for OTP-only accounts (legacy DB columns may be NOT NULL). */
async function createOtpOnlyCredentials(): Promise<{ salt: string; passwordHash: string }> {
  const salt = generateSalt();
  const passwordHash = await hashPassword(generateSalt(), salt);
  return { salt, passwordHash };
}

async function requireAdmin(): Promise<PrismaUser> {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") throw new AuthError("FORBIDDEN");
  const stored = await prisma.user.findUnique({ where: { id: currentUser.id } });
  if (!stored) throw new AuthError("FORBIDDEN");
  return stored;
}

function validateRole(role: string): UserRole {
  if (role !== "admin" && role !== "user") throw new AuthError("GENERIC");
  return role;
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_KEY);
  return session?.value || null;
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.isActive) {
    if (user && !user.isActive) {
      await logoutAction();
    }
    return null;
  }

  return toPublicUser(user);
}

export async function registerAction(input: RegisterInput): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const email = normalizeEmail(input.email);
    const password = input.password;

    if (!email || !password) throw new AuthError("EMPTY_FIELD");
    if (!EMAIL_REGEX.test(email)) throw new AuthError("INVALID_EMAIL");
    if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AuthError("EMAIL_EXISTS");

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const isFirstUser = (await prisma.user.count()) === 0;
    const role = isFirstUser ? "admin" : "user";

    const fullName = input.fullName?.trim() || email.split("@")[0];

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        salt,
        role,
        isActive: true,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_KEY, user.id, {
      httpOnly: true,
      secure: useSecureSessionCookie(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return toPublicUser(user);
  });
}

export async function loginAction(emailInput: string, passwordInput: string): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const email = normalizeEmail(emailInput);
    if (!email || !passwordInput) throw new AuthError("EMPTY_FIELD");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AuthError("INVALID_CREDENTIALS");
    if (!user.isActive) throw new AuthError("USER_INACTIVE");

    if (!user.passwordHash || !user.salt) {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    const ok = await verifyPassword(passwordInput, user.salt, user.passwordHash);
    if (!ok) throw new AuthError("INVALID_CREDENTIALS");

    const cookieStore = await cookies();
    cookieStore.set(SESSION_KEY, user.id, {
      httpOnly: true,
      secure: useSecureSessionCookie(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return toPublicUser(user);
  });
}

export async function sendOtpAction(emailInput: string): Promise<AuthActionResult<{ success: boolean }>> {
  return runAuthAction(async () => {
    const email = normalizeEmail(emailInput);
    if (!email) throw new AuthError("EMPTY_FIELD");
    if (!EMAIL_REGEX.test(email)) throw new AuthError("INVALID_EMAIL");

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Auto-register using email prefix as username
      const username = email.split("@")[0];
      const isFirstUser = (await prisma.user.count()) === 0;
      const role = isFirstUser ? "admin" : "user";
      const credentials = await createOtpOnlyCredentials();

      user = await prisma.user.create({
        data: {
          email,
          fullName: username,
          passwordHash: credentials.passwordHash,
          salt: credentials.salt,
          role,
          isActive: true,
        },
      });
    }

    if (!user.isActive) throw new AuthError("USER_INACTIVE");

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode,
        otpExpiresAt,
      },
    });

    try {
      await sendOtpEmail(email, otpCode);
    } catch (err) {
      console.error("[sendOtpAction] Failed to send OTP email:", err);
      throw new AuthError("OTP_SEND_FAILED");
    }

    return { success: true };
  });
}

export async function loginWithOtpAction(emailInput: string, code: string): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const email = normalizeEmail(emailInput);
    if (!email || !code) throw new AuthError("EMPTY_FIELD");

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AuthError("INVALID_CREDENTIALS");
    if (!user.isActive) throw new AuthError("USER_INACTIVE");

    if (!user.otpCode || user.otpCode !== code) {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    if (!user.otpExpiresAt || user.otpExpiresAt.getTime() < Date.now()) {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    // Clear OTP fields after use
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpCode: null,
        otpExpiresAt: null,
      },
    });

    const cookieStore = await cookies();
    cookieStore.set(SESSION_KEY, user.id, {
      httpOnly: true,
      secure: useSecureSessionCookie(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return toPublicUser(user);
  });
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

export async function updateMyProfileAction(patch: { fullName?: string, phone?: string, avatar?: string | null }): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const userId = await getSessionUserId();
    if (!userId) throw new AuthError("GENERIC");

    const data: any = {};
    if (patch.fullName !== undefined) data.fullName = patch.fullName.trim();
    if (patch.phone !== undefined) data.phone = patch.phone.trim() || null;
    if (patch.avatar !== undefined) data.avatar = patch.avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: data as any
    });

    return toPublicUser(user);
  });
}

export async function listUsersAction(): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>[]>> {
  return runAuthAction(async () => {
    await requireAdmin();

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" }
    });

    return users.map(toPublicUser);
  });
}

export async function createUserAction(input: AdminCreateUserInput): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    await requireAdmin();

    const email = normalizeEmail(input.email);
    const fullName = input.fullName.trim();
    const password = input.password;
    const role = validateRole(input.role ?? "user");

    if (!email || !fullName || !password) throw new AuthError("EMPTY_FIELD");
    if (!EMAIL_REGEX.test(email)) throw new AuthError("INVALID_EMAIL");
    if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new AuthError("EMAIL_EXISTS");

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);

    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        salt,
        role,
        isActive: input.isActive ?? true,
        avatar: (input as any).avatar ?? null,
      } as any
    });

    return toPublicUser(user);
  });
}

export async function updateUserAction(id: string, patch: AdminUpdateUserInput): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const currentUser = await requireAdmin();

    const data: any = {};
    if (patch.email !== undefined) {
      const email = normalizeEmail(patch.email);
      if (!email) throw new AuthError("EMPTY_FIELD");
      if (!EMAIL_REGEX.test(email)) throw new AuthError("INVALID_EMAIL");
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== id) throw new AuthError("EMAIL_EXISTS");
      data.email = email;
    }

    if (patch.fullName !== undefined) {
      const fullName = patch.fullName.trim();
      if (!fullName) throw new AuthError("EMPTY_FIELD");
      data.fullName = fullName;
    }

    if (patch.role !== undefined) {
      if (id === currentUser.id) throw new AuthError("FORBIDDEN");
      data.role = validateRole(patch.role);
    }

    if (patch.isActive !== undefined) {
      if (id === currentUser.id && !patch.isActive) throw new AuthError("FORBIDDEN");
      data.isActive = patch.isActive;
    }

    const password = patch.password?.trim();
    if (password) {
      if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");
      const salt = generateSalt();
      data.salt = salt;
      data.passwordHash = await hashPassword(password, salt);
    }

    if (patch.avatar !== undefined) {
      data.avatar = patch.avatar;
    }

    const user = await prisma.user.update({
      where: { id },
      data: data as any
    });

    return toPublicUser(user);
  });
}

export async function resetPasswordAction(id: string, newPassword: string): Promise<AuthActionResult<void>> {
  return runAuthAction(async () => {
    await requireAdmin();

    if (newPassword.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    await prisma.user.update({
      where: { id },
      data: { salt, passwordHash }
    });
  });
}

export async function setMyPasswordAction(newPassword: string): Promise<AuthActionResult<void>> {
  return runAuthAction(async () => {
    const userId = await getSessionUserId();
    if (!userId) throw new AuthError("GENERIC");

    if (!newPassword) throw new AuthError("EMPTY_FIELD");
    if (newPassword.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    await prisma.user.update({
      where: { id: userId },
      data: { salt, passwordHash },
    });
  });
}

export async function updateUserRoleAction(id: string, role: string): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    await requireAdmin();

    const user = await prisma.user.update({
      where: { id },
      data: { role: validateRole(role) }
    });

    return toPublicUser(user);
  });
}

export async function setUserActiveAction(id: string, isActive: boolean): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const currentUser = await requireAdmin();

    const user = await prisma.user.update({
      where: { id },
      data: { isActive }
    });

    if (!isActive && id === currentUser.id) {
      await logoutAction();
    }

    return toPublicUser(user);
  });
}

export async function deleteUserAction(id: string): Promise<AuthActionResult<void>> {
  return runAuthAction(async () => {
    const currentUser = await requireAdmin();

    await prisma.user.delete({
      where: { id }
    });

    if (id === currentUser.id) {
      await logoutAction();
    }
  });
}
