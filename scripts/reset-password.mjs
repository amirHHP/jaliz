#!/usr/bin/env node
/**
 * Reset a user's password directly in the DB.
 *
 * Usage:
 *   node scripts/reset-password.mjs <email> <new_password>
 *
 * VM/Docker Usage:
 *   docker compose exec web node /app/scripts/reset-password.mjs email@example.com 'NewSecret123'
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

const MIN_PASSWORD_LENGTH = 6

function generateSalt() {
  return crypto.randomBytes(16).toString("hex")
}

async function hashPassword(password, salt) {
  const data = Buffer.from(`${salt}:${password}`, "utf8")
  return crypto.createHash("sha256").update(data).digest("hex")
}

function usage() {
  console.error(`Usage: node reset-password.mjs <email> <new_password>`)
  process.exit(1)
}

const [emailRaw, password] = process.argv.slice(2)
if (!emailRaw || !password) usage()

const email = emailRaw.trim().toLowerCase()

if (password.length < MIN_PASSWORD_LENGTH) {
  console.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  process.exit(1)
}

try {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  const salt = generateSalt()
  const passwordHash = await hashPassword(password, salt)

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      salt
    }
  })

  console.log("Successfully reset password for user:")
  console.log(`  id:    ${updatedUser.id}`)
  console.log(`  email: ${updatedUser.email}`)
  console.log(`  name:  ${updatedUser.fullName}`)
} catch (err) {
  console.error("Failed:", err.message ?? err)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
