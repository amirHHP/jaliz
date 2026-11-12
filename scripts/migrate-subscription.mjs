#!/usr/bin/env node
/**
 * Migration: Payment table for watering-reminder subscriptions.
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
      "type" TEXT NOT NULL DEFAULT 'subscription',
      "listingId" TEXT,
      "buyerPhone" TEXT,
      "buyerAddress" TEXT,
      "buyerNotes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "paidAt" DATETIME,
      "expiresAt" DATETIME,
      CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )
  `)
  console.log("✅ Ensured Payment table exists")

  // Ensure columns exist FIRST before attempting to index them
  await addColumnIfMissing("Payment", "type", "TEXT DEFAULT 'subscription'")
  await addColumnIfMissing("Payment", "listingId", "TEXT")
  await addColumnIfMissing("Payment", "buyerPhone", "TEXT")
  await addColumnIfMissing("Payment", "buyerAddress", "TEXT")
  await addColumnIfMissing("Payment", "buyerNotes", "TEXT")
  await addColumnIfMissing("Payment", "expiresAt", "DATETIME")
  await addColumnIfMissing("Payment", "paidAt", "DATETIME")
  await addColumnIfMissing("Payment", "refId", "TEXT")
  await addColumnIfMissing("Payment", "description", "TEXT DEFAULT ''")

  const indexes = [
    { name: "Payment_authority_key", sql: `CREATE UNIQUE INDEX IF NOT EXISTS "Payment_authority_key" ON "Payment"("authority");` },
    { name: "Payment_userId_idx", sql: `CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");` },
    { name: "Payment_status_idx", sql: `CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");` },
    { name: "Payment_expiresAt_idx", sql: `CREATE INDEX IF NOT EXISTS "Payment_expiresAt_idx" ON "Payment"("expiresAt");` },
    { name: "Payment_listingId_idx", sql: `CREATE INDEX IF NOT EXISTS "Payment_listingId_idx" ON "Payment"("listingId");` },
  ]
  for (const idx of indexes) {
    try {
      await prisma.$executeRawUnsafe(idx.sql)
      console.log(`✅ Ensured index ${idx.name}`)
    } catch (err) {
      const msg = err.message || String(err)
      if (!msg.includes("already exists")) {
        console.warn(`⚠️ Could not create index ${idx.name}:`, msg)
      }
    }
  }
}

try {
  await createPaymentTableIfMissing()
  console.log("✅ Subscription migration complete.")
  console.log("Note: User.subscriptionExpiresAt is no longer required for auth.")
} catch (err) {
  console.error("❌ Subscription migration failed:", err.message || err)
  if (!process.env.TURSO_AUTH_TOKEN && (dbUrl.startsWith("libsql://") || dbUrl.startsWith("https://"))) {
    console.warn("⚠️ TURSO_AUTH_TOKEN not provided, skipping remote migration.")
  } else {
    process.exit(1)
  }
} finally {
  await prisma.$disconnect()
}
