import { NextResponse } from 'next/server'

// We'll store settings in a simple key-value format
export async function GET() {
  try {
    const settings = {
      totalSessions: 14, // Default value
      attendanceThreshold: 60 // Default value
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const settings = {
      totalSessions: body.totalSessions,
      attendanceThreshold: body.attendanceThreshold
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Error updating settings' }, { status: 500 })
  }
} 