'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import AttendanceTable from '@/components/attendance-table'
import StudentList from '@/components/student-list'
import SettingsPanel from '@/components/settings-panel'
import AttendanceExcel from '@/components/attendance-excel'
import type { Student, Session, AttendanceRecord } from '@/lib/db'

interface Settings {
  id: string
  totalSessions: number
  firstPartSessions: number
  attendanceThreshold: number
}

interface Props {
  initialStudents: Student[]
  initialSessions: Session[]
  initialAttendance: AttendanceRecord[]
  settings: Settings
}

export default function ClientPage({
  initialStudents,
  initialSessions,
  initialAttendance,
  settings,
}: Props) {
  const [activeTab, setActiveTab] = useState('attendance')
  const [students, setStudents] = useState<Student[]>(initialStudents)
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialAttendance)

  return (
    <main className="container mx-auto px-4 py-4">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Asistencia</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 mb-12">
          <TabsTrigger value="attendance">Tomar Asistencia</TabsTrigger>
          <TabsTrigger value="excel">Vista General</TabsTrigger>
          <TabsTrigger value="students">agorenses</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceTable
            students={students}
            sessions={sessions}
            attendance={attendance}
            setAttendance={setAttendance}
            setSessions={setSessions}
            totalSessions={settings.totalSessions}
            firstPartSessions={settings.firstPartSessions}
          />
        </TabsContent>

        <TabsContent value="excel" className="mt-6">
          <AttendanceExcel
            students={students}
            sessions={sessions}
            attendance={attendance}
            attendanceThreshold={settings.attendanceThreshold}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentList
            students={students}
            setStudents={setStudents}
            sessions={sessions}
            attendance={attendance}
            totalSessions={settings.totalSessions}
            attendanceThreshold={settings.attendanceThreshold}
          />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <SettingsPanel
            totalSessions={settings.totalSessions}
            firstPartSessions={settings.firstPartSessions}
            attendanceThreshold={settings.attendanceThreshold}
          />
        </TabsContent>
      </Tabs>
    </main>
  )
} 