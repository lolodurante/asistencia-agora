"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AttendanceTable from "@/components/attendance-table"
import StudentList from "@/components/student-list"
import SettingsPanel from "@/components/settings-panel"
import AttendanceExcel from "@/components/attendance-excel"

// Define the types
type Student = {
  id: string
  name: string
}

type Session = {
  id: string
  date: string
  part: 1 | 2
  number: number
  name: string
}

type AttendanceRecord = {
  studentId: string
  sessionId: string
  status: "present" | "absent" | "justified"
  justification?: string
}

export default function Home() {
  const [activeTab, setActiveTab] = useState("attendance")
  const [students, setStudents] = useState<Student[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [totalSessions, setTotalSessions] = useState(14)
  const [attendanceThreshold, setAttendanceThreshold] = useState(60)

  // Load data from localStorage on initial render
  useEffect(() => {
    const savedStudents = localStorage.getItem("students")
    const savedSessions = localStorage.getItem("sessions")
    const savedAttendance = localStorage.getItem("attendance")
    const savedTotalSessions = localStorage.getItem("totalSessions")
    const savedAttendanceThreshold = localStorage.getItem("attendanceThreshold")

    if (savedStudents) setStudents(JSON.parse(savedStudents))
    if (savedSessions) setSessions(JSON.parse(savedSessions))
    if (savedAttendance) setAttendance(JSON.parse(savedAttendance))
    if (savedTotalSessions) setTotalSessions(Number.parseInt(savedTotalSessions))
    if (savedAttendanceThreshold) setAttendanceThreshold(Number.parseInt(savedAttendanceThreshold))
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("students", JSON.stringify(students))
    localStorage.setItem("sessions", JSON.stringify(sessions))
    localStorage.setItem("attendance", JSON.stringify(attendance))
    localStorage.setItem("totalSessions", totalSessions.toString())
    localStorage.setItem("attendanceThreshold", attendanceThreshold.toString())
  }, [students, sessions, attendance, totalSessions, attendanceThreshold])

  return (
    <main className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Asistencia</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attendance">Tomar Asistencia</TabsTrigger>
          <TabsTrigger value="excel">Vista General</TabsTrigger>
          <TabsTrigger value="students">Estudiantes</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTable
            students={students}
            sessions={sessions}
            attendance={attendance}
            setAttendance={setAttendance}
            setSessions={setSessions}
            totalSessions={totalSessions}
          />
        </TabsContent>

        <TabsContent value="excel" className="mt-6">
          <AttendanceExcel
            students={students}
            sessions={sessions}
            attendance={attendance}
            attendanceThreshold={attendanceThreshold}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentList
            students={students}
            setStudents={setStudents}
            sessions={sessions}
            attendance={attendance}
            totalSessions={totalSessions}
            attendanceThreshold={attendanceThreshold}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel
            totalSessions={totalSessions}
            setTotalSessions={setTotalSessions}
            attendanceThreshold={attendanceThreshold}
            setAttendanceThreshold={setAttendanceThreshold}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
}

