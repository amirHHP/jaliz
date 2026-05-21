#!/usr/bin/env node
/**
 * Create a user directly in the SQLite DB (production / Docker).
 *
 * Usage (on server, from repo root):
 *   docker compose exec web node /app/scripts/create-user.mjs EMAIL PASSWORD "Full Name" [admin|user]
 *
 * Example:
 *   docker compose exec web node /app/scripts/create-user.mjs ali@example.com 'Secret123' 'Ali Rezaei' admin
 */

import crypto from "node:crypto"

const dbUrl = (process.env.DATABASE_URL || "").trim()
let prisma

if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
  const { PrismaClient } = await import("@prisma/client")
  const { PrismaLibSql } = await import("@prisma/adapter-libsql")

  const adapter = new PrismaLibSql({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  prisma = new PrismaClient({ adapter })
} else {
  const { PrismaClient } = await import("@prisma/client")
  prisma = new PrismaClient()
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 6

function generateSalt() {
  return crypto.randomBytes(16).toString("hex")
}

async function hashPassword(password, salt) {
  const data = Buffer.from(`${salt}:${password}`, "utf8")
  return crypto.createHash("sha256").update(data).digest("hex")
}

function usage() {
  console.error(`Usage: node create-user.mjs <email> <password> "<full name>" [admin|user]`)
  process.exit(1)
}

const [emailRaw, password, fullName, roleArg = "user"] = process.argv.slice(2)
if (!emailRaw || !password || !fullName) usage()

const email = emailRaw.trim().toLowerCase()
const role = roleArg === "admin" ? "admin" : roleArg === "user" ? "user" : null

if (!EMAIL_REGEX.test(email)) {
  console.error("Invalid email")
  process.exit(1)
}
if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  process.exit(1)
}
if (!role) {
  console.error('Role must be "admin" or "user"')
  process.exit(1)
}

try {
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.error(`User already exists: ${email} (id=${existing.id})`)
    process.exit(1)
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  const user = await prisma.user.create({
    data: {
      email,
      fullName: fullName.trim(),
      passwordHash,
      salt,
      role,
      isActive: true,
    },
  })

  console.log("Created user:")
  console.log(`  id:       ${user.id}`)
  console.log(`  email:    ${user.email}`)
  console.log(`  name:     ${user.fullName}`)
  console.log(`  role:     ${user.role}`)
  console.log(`  database: ${process.env.DATABASE_URL ?? "(default)"}`)
} catch (err) {
  console.error("Failed:", err.message ?? err)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
