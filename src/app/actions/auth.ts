"use server";

import { cookies } from "next/headers";
import type { User as PrismaUser } from "@prisma/client";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  signSessionValue,
  verifyAndExtractSessionUserId,
  useSecureSessionCookie,
} from "@/lib/auth/session-cookie";
import {
  AuthActionResult,
  runAuthAction,
  toPublicUser,
} from "@/lib/auth/server-action";
import { AdminCreateUserInput, AdminUpdateUserInput, RegisterInput, AuthError } from "@/lib/auth/types";
import { UserRole } from "@/lib/auth/types";
import { sendOtpEmail } from "@/lib/email/send-otp-email";
import { getSubscriptionExpiresAtForUser } from "@/lib/subscription-status";
import { nextSubscriptionExpiry } from "@/lib/subscription";

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
  if (!session?.value) return null;
  return verifyAndExtractSessionUserId(session.value);
}

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  if (typeof (prisma as any)?.ensureDatabaseSchema === "function") {
    await (prisma as any).ensureDatabaseSchema().catch(() => {});
  }

  let user: any;
  try {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: { shop: { select: { id: true, name: true } }, ownedShop: { select: { id: true, name: true } } }
    });
  } catch (err) {
    console.error("Failed to query user with shop relations:", err);
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch {
      return null;
    }
  }

  if (!user || !user.isActive) {
    if (user && !user.isActive) {
      await logoutAction();
    }
    return null;
  }

  const subscriptionExpiresAt = await getSubscriptionExpiresAtForUser(user.id);
  return {
    ...toPublicUser(user),
    subscriptionExpiresAt: subscriptionExpiresAt?.toISOString() ?? null,
  };
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
    cookieStore.set(SESSION_KEY, signSessionValue(user.id), {
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
    cookieStore.set(SESSION_KEY, signSessionValue(user.id), {
      httpOnly: true,
      secure: useSecureSessionCookie(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return toPublicUser(user);
  });
}

const OTP_RESEND_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes
const MAX_OTP_ATTEMPTS = 5;

export async function sendOtpAction(emailInput: string): Promise<AuthActionResult<{ success: boolean }>> {
  return runAuthAction(async () => {
    const email = normalizeEmail(emailInput);
    if (!email) throw new AuthError("EMPTY_FIELD");
    if (!EMAIL_REGEX.test(email)) throw new AuthError("INVALID_EMAIL");

    // If account exists, verify it is active
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser && !existingUser.isActive) {
      throw new AuthError("USER_INACTIVE");
    }

    // Rate limit resend: require at least 2 minutes between sends
    const existingOtp = await prisma.otpVerification.findUnique({ where: { email } });
    if (existingOtp && Date.now() - existingOtp.lastSentAt.getTime() < OTP_RESEND_COOLDOWN_MS) {
      throw new AuthError("OTP_RATE_LIMITED");
    }

    // Cryptographically secure 6-digit OTP
    const otpCode = crypto.randomInt(100000, 1000000).toString();
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in OtpVerification table without creating the user yet
    await prisma.otpVerification.upsert({
      where: { email },
      create: {
        email,
        code: otpCode,
        expiresAt: otpExpiresAt,
        lastSentAt: new Date(),
        attempts: 0,
      },
      update: {
        code: otpCode,
        expiresAt: otpExpiresAt,
        lastSentAt: new Date(),
        attempts: 0,
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

function safeCompareOtp(provided: string, expected: string): boolean {
  if (!provided || !expected) return false;
  const bufA = Buffer.from(provided, "utf-8");
  const bufB = Buffer.from(expected, "utf-8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export async function loginWithOtpAction(emailInput: string, code: string): Promise<AuthActionResult<Awaited<ReturnType<typeof toPublicUser>>>> {
  return runAuthAction(async () => {
    const email = normalizeEmail(emailInput);
    const cleanCode = code ? code.trim() : "";
    if (!email || !cleanCode) throw new AuthError("EMPTY_FIELD");

    const otpRecord = await prisma.otpVerification.findUnique({ where: { email } });
    if (!otpRecord) throw new AuthError("INVALID_CREDENTIALS");

    // Check lockout first (must persist across failed attempts to prevent cooldown bypass)
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      throw new AuthError("OTP_LOCKED");
    }

    // Check expiration
    if (otpRecord.expiresAt.getTime() < Date.now()) {
      throw new AuthError("INVALID_CREDENTIALS");
    }

    // Timing-safe code match check
    if (!safeCompareOtp(cleanCode, otpRecord.code)) {
      const nextAttempts = otpRecord.attempts + 1;
      await prisma.otpVerification.update({
        where: { email },
        data: { attempts: nextAttempts },
      });
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        throw new AuthError("OTP_LOCKED");
      }
      throw new AuthError("INVALID_CREDENTIALS");
    }

    // Valid code: consume OTP
    await prisma.otpVerification.delete({ where: { email } }).catch(() => {});

    // Only create user in DB after successful verification
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
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

    const cookieStore = await cookies();
    cookieStore.set(SESSION_KEY, signSessionValue(user.id), {
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

    const payments = await prisma.payment.findMany({
      where: {
        userId: { in: users.map((u) => u.id) },
        status: "paid",
        expiresAt: { not: null },
      },
      select: { userId: true, expiresAt: true },
    });

    const expiryMap = new Map<string, Date>();
    for (const p of payments) {
      if (p.expiresAt) {
        const existing = expiryMap.get(p.userId);
        if (!existing || p.expiresAt.getTime() > existing.getTime()) {
          expiryMap.set(p.userId, p.expiresAt);
        }
      }
    }

    return users.map((u) => ({
      ...toPublicUser(u),
      subscriptionExpiresAt: expiryMap.get(u.id)?.toISOString() ?? null,
    }));
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

export async function grantUsersSubscriptionAction(
  userIds: string[],
  durationDays: number,
  reason?: string
): Promise<AuthActionResult<{ count: number }>> {
  return runAuthAction(async () => {
    await requireAdmin();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AuthError("EMPTY_FIELD");
    }
    if (typeof durationDays !== "number" || durationDays <= 0) {
      throw new AuthError("GENERIC");
    }

    const now = new Date();
    const isPermanent = durationDays >= 36500; // >= 100 years

    for (const userId of userIds) {
      let expiresAt: Date;
      if (isPermanent) {
        expiresAt = new Date("2099-12-31T23:59:59.999Z");
      } else {
        const currentExpiresAt = await getSubscriptionExpiresAtForUser(userId);
        expiresAt = nextSubscriptionExpiry(currentExpiresAt, now, durationDays);
      }

      const authority = `admin_grant_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await prisma.payment.create({
        data: {
          userId,
          authority,
          amount: 0,
          status: "paid",
          type: "subscription",
          description: reason?.trim() || "دسترسی اعطا شده توسط مدیر",
          paidAt: now,
          expiresAt,
        },
      });
    }

    return { count: userIds.length };
  });
}

export async function revokeUsersSubscriptionAction(
  userIds: string[]
): Promise<AuthActionResult<{ count: number }>> {
  return runAuthAction(async () => {
    await requireAdmin();
    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new AuthError("EMPTY_FIELD");
    }

    const now = new Date();
    const result = await prisma.payment.updateMany({
      where: {
        userId: { in: userIds },
        status: "paid",
        expiresAt: { gt: now },
      },
      data: {
        expiresAt: now,
      },
    });

    return { count: result.count };
  });
}
