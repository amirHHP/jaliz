#!/usr/bin/env node
/**
 * Migration: Customer Club (Shop table, User.shopId column, OtpVerification table).
 *
 * Usage:
 *   # For Turso / libsql production:
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/migrate-customer-club.mjs
 *
 *   # For local SQLite:
 *   DATABASE_URL="file:./prisma/dev.db" node scripts/migrate-customer-club.mjs
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
      `ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`
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

async function createShopTableIfMissing() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Shop" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "ownerId" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
    );
  `)
  console.log("✅ Ensured Shop table exists")

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "Shop_code_key" ON "Shop"("code");`
    )
  } catch (err) {
    const msg = err.message || String(err)
    if (!msg.includes("already exists")) throw err
  }

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "Shop_ownerId_key" ON "Shop"("ownerId");`
    )
  } catch (err) {
    const msg = err.message || String(err)
    if (!msg.includes("already exists")) throw err
  }

  await addColumnIfMissing("User", "shopId", "TEXT")
}

async function createOtpTableIfMissing() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "OtpVerification" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "email" TEXT NOT NULL,
      "code" TEXT NOT NULL,
      "expiresAt" DATETIME NOT NULL,
      "lastSentAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "attempts" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `)
  console.log("✅ Ensured OtpVerification table exists")

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "OtpVerification_email_key" ON "OtpVerification"("email");`
    )
  } catch (err) {
    const msg = err.message || String(err)
    if (!msg.includes("already exists")) throw err
  }

  try {
    await prisma.$executeRawUnsafe(
      `CREATE INDEX IF NOT EXISTS "OtpVerification_email_idx" ON "OtpVerification"("email");`
    )
  } catch (err) {
    const msg = err.message || String(err)
    if (!msg.includes("already exists")) throw err
  }
}

try {
  await createShopTableIfMissing()
  await createOtpTableIfMissing()
  console.log("✅ Customer club migration completed successfully.")
} catch (err) {
  console.error("❌ Migration failed:", err.message || err)
  // Don't fail the build if DB credentials are not present during local build
  if (!process.env.TURSO_AUTH_TOKEN && (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://"))) {
    console.warn("⚠️ TURSO_AUTH_TOKEN not provided, skipping remote migration.")
  } else {
    process.exit(1)
  }
} finally {
  await prisma.$disconnect()
}
