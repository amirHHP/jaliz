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

  return client
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
