import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

export async function applyPrismaPragmas(client: PrismaClient) {
  try {
    await client.$queryRawUnsafe('PRAGMA journal_mode = WAL;')
    await client.$queryRawUnsafe('PRAGMA busy_timeout = 5000;')
    await client.$queryRawUnsafe('PRAGMA synchronous = NORMAL;')
  } catch (err) {
    console.error('Failed to configure SQLite PRAGMAs:', err)
  }
}

let schemaEnsured = false
let schemaPromise: Promise<void> | null = null

export async function ensureDatabaseSchema(client: PrismaClient = prisma): Promise<void> {
  if (!client || typeof (client as any).$executeRawUnsafe !== "function") return
  if (schemaEnsured) return
  if (schemaPromise) return schemaPromise

  schemaPromise = (async () => {
    try {
      await client.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "Shop" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "name" TEXT NOT NULL,
          "code" TEXT NOT NULL,
          "ownerId" TEXT NOT NULL,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Shop_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `)
      await client.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Shop_code_key" ON "Shop"("code");`)
      await client.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Shop_ownerId_key" ON "Shop"("ownerId");`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (!msg.includes("already exists")) {
        console.warn("[ensureDatabaseSchema] Shop notice:", msg)
      }
    }

    try {
      await client.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN "shopId" TEXT;`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
        console.warn("[ensureDatabaseSchema] User.shopId notice:", msg)
      }
    }

    try {
      await client.$executeRawUnsafe(`
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
      await client.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "OtpVerification_email_key" ON "OtpVerification"("email");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "OtpVerification_email_idx" ON "OtpVerification"("email");`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (!msg.includes("already exists")) {
        console.warn("[ensureDatabaseSchema] OtpVerification notice:", msg)
      }
    }

    try {
      await client.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ShopMessage" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "shopId" TEXT NOT NULL,
          "senderId" TEXT NOT NULL,
          "recipientId" TEXT,
          "title" TEXT,
          "body" TEXT NOT NULL,
          "isBroadcast" BOOLEAN NOT NULL DEFAULT 0,
          "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ShopMessage_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "ShopMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "ShopMessage_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShopMessage_shopId_createdAt_idx" ON "ShopMessage"("shopId", "createdAt");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShopMessage_recipientId_idx" ON "ShopMessage"("recipientId");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShopMessage_senderId_idx" ON "ShopMessage"("senderId");`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (!msg.includes("already exists")) {
        console.warn("[ensureDatabaseSchema] ShopMessage notice:", msg)
      }
    }

    try {
      await client.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "ShopMessageRead" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "messageId" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "readAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ShopMessageRead_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "ShopMessage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "ShopMessageRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
      `)
      await client.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "ShopMessageRead_messageId_userId_key" ON "ShopMessageRead"("messageId", "userId");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "ShopMessageRead_userId_idx" ON "ShopMessageRead"("userId");`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (!msg.includes("already exists")) {
        console.warn("[ensureDatabaseSchema] ShopMessageRead notice:", msg)
      }
    }

    try {
      await client.$executeRawUnsafe(`
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
        );
      `)
      await client.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Payment_authority_key" ON "Payment"("authority");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Payment_userId_idx" ON "Payment"("userId");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Payment_expiresAt_idx" ON "Payment"("expiresAt");`)
      await client.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Payment_listingId_idx" ON "Payment"("listingId");`)
    } catch (err: any) {
      const msg = err?.message || String(err)
      if (!msg.includes("already exists")) {
        console.warn("[ensureDatabaseSchema] Payment table notice:", msg)
      }
    }

    const paymentColumns = [
      { col: "type", type: "TEXT DEFAULT 'subscription'" },
      { col: "listingId", type: "TEXT" },
      { col: "buyerPhone", type: "TEXT" },
      { col: "buyerAddress", type: "TEXT" },
      { col: "buyerNotes", type: "TEXT" },
      { col: "expiresAt", type: "DATETIME" },
      { col: "paidAt", type: "DATETIME" },
      { col: "refId", type: "TEXT" },
      { col: "description", type: "TEXT DEFAULT ''" },
    ]
    for (const { col, type } of paymentColumns) {
      try {
        await client.$executeRawUnsafe(`ALTER TABLE "Payment" ADD COLUMN "${col}" ${type};`)
      } catch (err: any) {
        const msg = err?.message || String(err)
        if (!msg.includes("duplicate column") && !msg.includes("already exists")) {
          console.warn(`[ensureDatabaseSchema] Payment.${col} notice:`, msg)
        }
      }
    }

    schemaEnsured = true
  })().catch((err) => {
    schemaPromise = null
    console.warn("[ensureDatabaseSchema] failed:", err)
  })

  return schemaPromise
}

const prismaClientSingleton = () => {
  const dbUrl = (process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || '').trim()

  let client: PrismaClient
  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    // Set process.env.DATABASE_URL if not set, so Prisma Client doesn't complain
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = dbUrl
    }
    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    client = new PrismaClient({ adapter })
  } else {
    client = new PrismaClient()
  }

  if (!dbUrl.startsWith('libsql://') && !dbUrl.startsWith('https://')) {
    void applyPrismaPragmas(client)
  }

  void ensureDatabaseSchema(client)
  ;(client as any).ensureDatabaseSchema = () => ensureDatabaseSchema(client)

  return client
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma

