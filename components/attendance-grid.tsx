"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface Student {
  id: string
  name: string
}

interface Session {
  id: string
  date: string
  part: 1 | 2
  number: number
  name: string
}

interface AttendanceRecord {
  studentId: string
  sessionId: string
  status: "present" | "absent" | "justified"
  justification?: string
}

interface AttendanceGridProps {
  students: Student[]
  sessions: Session[]
  attendance: AttendanceRecord[]
  attendanceThreshold: number
}

export default function AttendanceGrid({ students, sessions, attendance, attendanceThreshold }: AttendanceGridProps) {
  const [showJustification, setShowJustification] = useState(false)
  const [selectedJustification, setSelectedJustification] = useState("")

  // Ordenar las sesiones por número
  const sortedSessions = [...sessions].sort((a, b) => a.number - b.number)

  const getAttendanceStatus = (studentId: string, sessionId: string) => {
    return attendance.find((record) => record.studentId === studentId && record.sessionId === sessionId)?.status || null
  }

  const calculateAttendancePercentage = (studentId: string, part: 1 | 2): number => {
    const partSessions = sessions.filter((session) => session.part === part)
    if (partSessions.length === 0) return 0

    const presentCount = partSessions.reduce((count, session) => {
      const record = attendance.find((r) => r.studentId === studentId && r.sessionId === session.id)

      return count + (record && (record.status === "present" || record.status === "justified") ? 1 : 0)
    }, 0)

    return Math.round((presentCount / partSessions.length) * 100)
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500 w-full">P</Badge>
      case "absent":
        return <Badge className="bg-red-500 w-full">A</Badge>
      case "justified":
        return <Badge className="bg-yellow-500 w-full cursor-pointer">J</Badge>
      default:
        return (
          <Badge variant="outline" className="w-full">
            -
          </Badge>
        )
    }
  }

  const showJustificationDialog = (justification: string) => {
    setSelectedJustification(justification || "No se proporcionó justificación")
    setShowJustification(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Grilla de Asistencia</CardTitle>
          <CardDescription>Vista general de asistencias por estudiante y encuentro</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-background sticky left-0 w-[200px]">Estudiante</TableHead>
                  {sortedSessions.map((session) => (
                    <TableHead key={session.id} className="text-center min-w-[60px]">
                      <div className="text-xs font-medium">E{session.number}</div>
                      <div className="text-xs text-muted-foreground">P{session.part}</div>
                    </TableHead>
                  ))}
                  <TableHead className="text-center">Parte 1</TableHead>
                  <TableHead className="text-center">Parte 2</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const part1Percentage = calculateAttendancePercentage(student.id, 1)
                  const part2Percentage = calculateAttendancePercentage(student.id, 2)

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="bg-background sticky left-0 w-[200px] font-medium">
                        {student.name}
                      </TableCell>
                      {sortedSessions.map((session) => {
                        const status = getAttendanceStatus(student.id, session.id)
                        const record = attendance.find((r) => r.studentId === student.id && r.sessionId === session.id)

                        return (
                          <TableCell key={session.id} className="text-center p-2">
                            {status === "justified" && record?.justification ? (
                              <div
                                onClick={() => showJustificationDialog(record.justification!)}
                                className="cursor-pointer"
                              >
                                {getStatusBadge(status)}
                              </div>
                            ) : (
                              getStatusBadge(status)
                            )}
                          </TableCell>
                        )
                      })}
                      <TableCell className="text-center">
                        <Badge
                          variant={part1Percentage >= attendanceThreshold ? "outline" : "destructive"}
                          className="w-full"
                        >
                          {part1Percentage}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={part2Percentage >= attendanceThreshold ? "outline" : "destructive"}
                          className="w-full"
                        >
                          {part2Percentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            <div className="mt-4 flex items-center gap-4 justify-end">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500">P</Badge>
                <span className="text-sm">Presente</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500">A</Badge>
                <span className="text-sm">Ausente</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500">J</Badge>
                <span className="text-sm">Justificado</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">-</Badge>
                <span className="text-sm">Sin registrar</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showJustification} onOpenChange={setShowJustification}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificación</DialogTitle>
            <DialogDescription>Detalle de la justificación</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm">{selectedJustification}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowJustification(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

