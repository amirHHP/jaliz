#!/usr/bin/env node
/**
 * One-time migration: add the `avatar` column to the User table.
 *
 * Usage:
 *   # For Turso/libsql production database:
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/migrate-add-avatar.mjs
 *
 *   # For local SQLite:
 *   DATABASE_URL="file:./prisma/dev.db" node scripts/migrate-add-avatar.mjs
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

try {
  await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "avatar" TEXT`)
  console.log("✅ Successfully added 'avatar' column to User table!")
} catch (err) {
  const msg = err.message || String(err)
  if (msg.includes("duplicate column") || msg.includes("already exists")) {
    console.log("ℹ️  Column 'avatar' already exists — nothing to do.")
  } else {
    console.error("❌ Error adding column:", msg)
    process.exit(1)
  }
} finally {
  await prisma.$disconnect()
}
