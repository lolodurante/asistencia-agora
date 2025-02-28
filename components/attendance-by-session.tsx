"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, FileText } from "lucide-react"
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

interface AttendanceBySessionProps {
  students: Student[]
  sessions: Session[]
  attendance: AttendanceRecord[]
}

export default function AttendanceBySession({ students, sessions, attendance }: AttendanceBySessionProps) {
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0)
  const [showJustification, setShowJustification] = useState(false)
  const [selectedJustification, setSelectedJustification] = useState("")

  // Ordenar las sesiones por número
  const sortedSessions = [...sessions].sort((a, b) => a.number - b.number)
  const currentSession = sortedSessions[currentSessionIndex]

  const getAttendanceStatus = (studentId: string) => {
    if (!currentSession) return null
    return (
      attendance.find((record) => record.studentId === studentId && record.sessionId === currentSession.id)?.status ||
      null
    )
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-500">Presente</Badge>
      case "absent":
        return <Badge className="bg-red-500">Ausente</Badge>
      case "justified":
        return <Badge className="bg-yellow-500">Justificado</Badge>
      default:
        return <Badge variant="outline">Sin registrar</Badge>
    }
  }

  const showJustificationDialog = (studentId: string) => {
    if (!currentSession) return
    const record = attendance.find((r) => r.studentId === studentId && r.sessionId === currentSession.id)
    setSelectedJustification(record?.justification || "No se proporcionó justificación")
    setShowJustification(true)
  }

  const getSessionStats = () => {
    if (!currentSession) return { present: 0, absent: 0, justified: 0, total: 0 }

    const stats = students.reduce(
      (acc, student) => {
        const status = getAttendanceStatus(student.id)
        if (status === "present") acc.present++
        else if (status === "absent") acc.absent++
        else if (status === "justified") acc.justified++
        return acc
      },
      { present: 0, absent: 0, justified: 0 },
    )

    return {
      ...stats,
      total: students.length,
    }
  }

  const stats = getSessionStats()

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vista por Encuentro</CardTitle>
          <CardDescription>No hay encuentros registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Crea encuentros en la pestaña de "Tomar Asistencia" para comenzar
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vista por Encuentro</CardTitle>
              <CardDescription>Navega entre los encuentros para ver la asistencia</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentSessionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentSessionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="w-[180px] text-center">
                <div className="text-sm text-muted-foreground">{currentSession?.name}</div>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentSessionIndex((prev) => Math.min(sessions.length - 1, prev + 1))}
                disabled={currentSessionIndex === sessions.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Total agorenses</CardDescription>
                <CardTitle>{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Presentes</CardDescription>
                <CardTitle className="text-green-500">{stats.present}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Ausentes</CardDescription>
                <CardTitle className="text-red-500">{stats.absent}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="p-4">
                <CardDescription>Justificados</CardDescription>
                <CardTitle className="text-yellow-500">{stats.justified}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>agorense</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => {
                  const status = getAttendanceStatus(student.id)
                  const hasJustification =
                    status === "justified" &&
                    attendance.find((r) => r.studentId === student.id && r.sessionId === currentSession?.id)
                      ?.justification

                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{getStatusBadge(status)}</TableCell>
                      <TableCell>
                        {hasJustification && (
                          <Button variant="ghost" size="icon" onClick={() => showJustificationDialog(student.id)}>
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
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

