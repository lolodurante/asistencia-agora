type Student = {
  id: string
  name: string
}

type Session = {
  id: string
  date: string
  part: 1 | 2
  number: number
  name?: string
}

type AttendanceStatus = "present" | "absent" | "justified"

type AttendanceRecord = {
  studentId: string
  sessionId: string
  status: AttendanceStatus
}

