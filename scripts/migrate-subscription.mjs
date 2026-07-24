#!/usr/bin/env node
/**
 * Migration: watering-reminder subscription fields + Payment table.
 *
 * Usage:
 *   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." node scripts/migrate-subscription.mjs
 *   DATABASE_URL="file:./prisma/dev.db" node scripts/migrate-subscription.mjs
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

async function createPaymentTableIfMissing() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Payment" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "authority" TEXT NOT NULL,
      "amount" INTEGER NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "refId" TEXT,
      "description" TEXT NOT NULL DEFAULT '',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "paidAt" DATETIME,
      CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  console.log("✅ Ensured Payment table exists")

  try {
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "Payment_authority_key" ON "Payment"("authority")`,
    )
  } catch (err) {
    const msg = err.message || String(err)
    if (!msg.includes("already exists")) throw err
  }
}

try {
  await addColumnIfMissing("User", "subscriptionExpiresAt", "DATETIME")
  await createPaymentTableIfMissing()
  console.log("✅ Subscription migration complete.")
} catch (err) {
  console.error("❌ Subscription migration failed:", err.message || err)
  process.exit(1)
} finally {
  await prisma.$disconnect()
}
