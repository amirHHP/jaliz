"use server";

import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password";
import { RegisterInput, AuthError } from "@/lib/auth/types";
import { UserRole } from "@/lib/auth/types";

const SESSION_KEY = "jaliz_session";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

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

  const { passwordHash, salt, ...publicUser } = user;
  return { ...publicUser, role: publicUser.role as UserRole };
}

export async function registerAction(input: RegisterInput) {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const password = input.password;

  if (!email || !fullName || !password) throw new AuthError("EMPTY_FIELD");
  if (!EMAIL_REGEX.test(email)) throw new AuthError("INVALID_EMAIL");
  if (password.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new AuthError("EMAIL_EXISTS");

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const isFirstUser = (await prisma.user.count()) === 0;
  const role = isFirstUser ? "admin" : "user";

  const user = await prisma.user.create({
    data: {
      email,
      fullName,
      passwordHash,
      salt,
      role,
      isActive: true,
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  const { passwordHash: _h, salt: _s, ...publicUser } = user;
  return { ...publicUser, role: publicUser.role as UserRole };
}

export async function loginAction(emailInput: string, passwordInput: string) {
  const email = normalizeEmail(emailInput);
  if (!email || !passwordInput) throw new AuthError("EMPTY_FIELD");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AuthError("USER_NOT_FOUND");
  if (!user.isActive) throw new AuthError("USER_INACTIVE");

  const ok = await verifyPassword(passwordInput, user.salt, user.passwordHash);
  if (!ok) throw new AuthError("INVALID_CREDENTIALS");

  const cookieStore = await cookies();
  cookieStore.set(SESSION_KEY, user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });

  const { passwordHash: _h, salt: _s, ...publicUser } = user;
  return { ...publicUser, role: publicUser.role as UserRole };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

export async function updateMyProfileAction(patch: { fullName?: string, phone?: string }) {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthError("GENERIC");

  const data: any = {};
  if (patch.fullName !== undefined) data.fullName = patch.fullName.trim();
  if (patch.phone !== undefined) data.phone = patch.phone.trim() || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data
  });

  const { passwordHash: _h, salt: _s, ...publicUser } = user;
  return { ...publicUser, role: publicUser.role as UserRole };
}

export async function listUsersAction() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") throw new AuthError("FORBIDDEN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" }
  });

  return users.map(user => {
    const { passwordHash: _h, salt: _s, ...publicUser } = user;
    return { ...publicUser, role: publicUser.role as UserRole };
  });
}

export async function updateUserRoleAction(id: string, role: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") throw new AuthError("FORBIDDEN");

  const user = await prisma.user.update({
    where: { id },
    data: { role }
  });

  const { passwordHash: _h, salt: _s, ...publicUser } = user;
  return { ...publicUser, role: publicUser.role as UserRole };
}

export async function setUserActiveAction(id: string, isActive: boolean) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") throw new AuthError("FORBIDDEN");

  const user = await prisma.user.update({
    where: { id },
    data: { isActive }
  });

  if (!isActive && id === currentUser.id) {
    await logoutAction();
  }

  const { passwordHash: _h, salt: _s, ...publicUser } = user;
  return { ...publicUser, role: publicUser.role as UserRole };
}

export async function deleteUserAction(id: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") throw new AuthError("FORBIDDEN");

  await prisma.user.delete({
    where: { id }
  });

  if (id === currentUser.id) {
    await logoutAction();
  }
}
