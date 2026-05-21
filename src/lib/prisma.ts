import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const prismaClientSingleton = () => {
  const dbUrl = (process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || '').trim()

  if (dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')) {
    // Set process.env.DATABASE_URL if not set, so Prisma Client doesn't complain
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = dbUrl
    }
    const adapter = new PrismaLibSQL({
      url: dbUrl,
      authToken: process.env.TURSO_AUTH_TOKEN,
    })
    return new PrismaClient({ adapter })
  }

  return new PrismaClient()
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
