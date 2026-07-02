#!/usr/bin/env node
/**
 * One-time migration: add OTP columns to the User table for passwordless login.
 *
 * Usage:
 *   # Turso / libsql:
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/migrate-otp-auth.mjs
 *
 *   # Local SQLite:
 *   DATABASE_URL="file:./prisma/dev.db" node scripts/migrate-otp-auth.mjs
 */

const dbUrl = (process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || "").trim()
let prisma

if (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://")) {
  const { PrismaClient } = await import("@prisma/client")
  const { PrismaLibSQL } = await import("@prisma/adapter-libsql")

  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = dbUrl
  }

  const adapter = new PrismaLibSQL({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  })
  prisma = new PrismaClient({ adapter })
} else {
  const { PrismaClient } = await import("@prisma/client")
  prisma = new PrismaClient()
}

async function addColumnIfMissing(table, column, type) {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`,
    )
    console.log(`✅ Added column ${table}.${column}`)
  } catch (err) {
    const msg = err.message || String(err)
    if (msg.includes("duplicate column") || msg.includes("already exists")) {
      console.log(`ℹ️  Column ${table}.${column} already exists`)
    } else {
      throw err
    }
  }
}

try {
  await addColumnIfMissing("User", "otpCode", "TEXT")
  await addColumnIfMissing("User", "otpExpiresAt", "DATETIME")
  console.log("✅ OTP auth migration complete.")
} catch (err) {
  console.error("❌ OTP auth migration failed:", err.message || err)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
