import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const attendance = await prisma.attendanceRecord.findMany({
      include: {
        student: true,
        session: true
      }
    })
    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json({ error: 'Error fetching attendance records' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const attendance = await prisma.attendanceRecord.create({
      data: {
        studentId: body.studentId,
        sessionId: body.sessionId,
        status: body.status
      },
      include: {
        student: true,
        session: true
      }
    })
    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json({ error: 'Error creating attendance record' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const attendance = await prisma.attendanceRecord.update({
      where: {
        studentId_sessionId: {
          studentId: body.studentId,
          sessionId: body.sessionId
        }
      },
      data: {
        status: body.status
      },
      include: {
        student: true,
        session: true
      }
    })
    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Error updating attendance record:', error)
    return NextResponse.json({ error: 'Error updating attendance record' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const sessionId = searchParams.get('sessionId')
    
    if (!studentId || !sessionId) {
      return NextResponse.json({ error: 'Student ID and Session ID are required' }, { status: 400 })
    }
    
    await prisma.attendanceRecord.delete({
      where: {
        studentId_sessionId: {
          studentId,
          sessionId
        }
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: 'Error deleting attendance record' }, { status: 500 })
  }
} 