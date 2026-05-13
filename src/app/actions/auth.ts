"use server";

import { cookies } from "next/headers";
import type { Prisma, User as PrismaUser } from "@prisma/client";
import prisma from "@/lib/prisma";
import { generateSalt, hashPassword, verifyPassword } from "@/lib/auth/password";
import { AdminCreateUserInput, AdminUpdateUserInput, RegisterInput, AuthError } from "@/lib/auth/types";
import { UserRole } from "@/lib/auth/types";

const SESSION_KEY = "jaliz_session";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

function toPublicUser(user: PrismaUser) {
  const { passwordHash, salt, ...publicUser } = user;
  void passwordHash;
  void salt;
  return { ...publicUser, role: publicUser.role as UserRole };
}

async function requireAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "admin") throw new AuthError("FORBIDDEN");
  return currentUser;
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

  return toPublicUser(user);
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

  return toPublicUser(user);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_KEY);
}

export async function updateMyProfileAction(patch: { fullName?: string, phone?: string }) {
  const userId = await getSessionUserId();
  if (!userId) throw new AuthError("GENERIC");

  const data: Prisma.UserUpdateInput = {};
  if (patch.fullName !== undefined) data.fullName = patch.fullName.trim();
  if (patch.phone !== undefined) data.phone = patch.phone.trim() || null;

  const user = await prisma.user.update({
    where: { id: userId },
    data
  });

  return toPublicUser(user);
}

export async function listUsersAction() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" }
  });

  return users.map(toPublicUser);
}

export async function createUserAction(input: AdminCreateUserInput) {
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
    }
  });

  return toPublicUser(user);
}

export async function updateUserAction(id: string, patch: AdminUpdateUserInput) {
  const currentUser = await requireAdmin();

  const data: Prisma.UserUpdateInput = {};
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

  const user = await prisma.user.update({
    where: { id },
    data
  });

  return toPublicUser(user);
}

export async function resetPasswordAction(id: string, newPassword: string) {
  await requireAdmin();

  if (newPassword.length < MIN_PASSWORD_LENGTH) throw new AuthError("WEAK_PASSWORD");

  const salt = generateSalt();
  const passwordHash = await hashPassword(newPassword, salt);

  await prisma.user.update({
    where: { id },
    data: { salt, passwordHash }
  });
}

export async function updateUserRoleAction(id: string, role: string) {
  await requireAdmin();

  const user = await prisma.user.update({
    where: { id },
    data: { role: validateRole(role) }
  });

  return toPublicUser(user);
}

export async function setUserActiveAction(id: string, isActive: boolean) {
  const currentUser = await requireAdmin();

  const user = await prisma.user.update({
    where: { id },
    data: { isActive }
  });

  if (!isActive && id === currentUser.id) {
    await logoutAction();
  }

  return toPublicUser(user);
}

export async function deleteUserAction(id: string) {
  const currentUser = await requireAdmin();

  await prisma.user.delete({
    where: { id }
  });

  if (id === currentUser.id) {
    await logoutAction();
  }
}
