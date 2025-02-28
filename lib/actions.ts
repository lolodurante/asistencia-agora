'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from './db'
import type { AttendanceStatus } from '@/lib/db'

export async function getStudents() {
  return prisma.student.findMany({
    orderBy: { name: 'asc' }
  })
}

export async function getSessions() {
  return prisma.session.findMany({
    orderBy: [
      { date: 'asc' },
      { part: 'asc' }
    ]
  })
}

export async function getAttendance() {
  return prisma.attendanceRecord.findMany({
    include: {
      student: true,
      session: true
    }
  })
}

export async function createStudent(name: string) {
  const student = await prisma.student.create({
    data: { name }
  })
  revalidatePath('/')
  return student
}

export async function createSession(data: {
  date: Date
  part: number
  number: number
  name?: string
}) {
  const session = await prisma.session.create({
    data
  })
  revalidatePath('/')
  return session
}

export async function updateAttendance(data: {
  studentId: string
  sessionId: string
  status: AttendanceStatus
  justification?: string
}) {
  const attendance = await prisma.attendanceRecord.upsert({
    where: {
      studentId_sessionId: {
        studentId: data.studentId,
        sessionId: data.sessionId
      }
    },
    update: {
      status: data.status,
      justification: data.justification
    },
    create: {
      studentId: data.studentId,
      sessionId: data.sessionId,
      status: data.status,
      justification: data.justification
    }
  })
  revalidatePath('/')
  return attendance
}

export async function deleteStudent(id: string) {
  // First, delete all attendance records for this student
  await prisma.attendanceRecord.deleteMany({
    where: { studentId: id }
  })
  
  // Then delete the student
  await prisma.student.delete({
    where: { id }
  })
  revalidatePath('/')
}

export async function deleteSession(id: string) {
  await prisma.session.delete({
    where: { id }
  })
  revalidatePath('/')
}

export async function getSettings() {
  let settings = await prisma.settings.findFirst()
  
  if (!settings) {
    // Create default settings if none exist
    settings = await prisma.settings.create({
      data: {
        totalSessions: 14,
        firstPartSessions: 7,
        attendanceThreshold: 60
      }
    })
  }
  
  return settings
}

export async function updateSettings(data: {
  totalSessions: number
  firstPartSessions: number
  attendanceThreshold: number
}) {
  const settings = await prisma.settings.findFirst()
  
  if (settings) {
    await prisma.settings.update({
      where: { id: settings.id },
      data
    })
  } else {
    await prisma.settings.create({
      data
    })
  }
  
  revalidatePath('/')
} 