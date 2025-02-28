import { PrismaClient } from '@prisma/client'
import type { Student, Session, AttendanceRecord, AttendanceStatus } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export type { Student, Session, AttendanceRecord, AttendanceStatus } 