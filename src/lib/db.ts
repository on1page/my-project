import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaUrl = "postgres://f03b6a41bc4fe4035e4453264b946e79599fdb927e81a68d46c785283a27a2ef:sk_ZRix9vrwCr66dqfYTJn1a@db.prisma.io:5432/postgres?sslmode=require"

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: prismaUrl
      }
    }
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db