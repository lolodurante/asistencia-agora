"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"
import type { Student, Session, AttendanceRecord, AttendanceStatus } from '@/lib/db'

interface AttendanceExcelProps {
  students: Student[]
  sessions: Session[]
  attendance: AttendanceRecord[]
  attendanceThreshold: number
}

export default function AttendanceExcel({ students, sessions, attendance, attendanceThreshold }: AttendanceExcelProps) {
  const [showJustification, setShowJustification] = useState(false)
  console.log(attendanceThreshold)
  const [selectedJustification, setSelectedJustification] = useState("")

  // Ordenar las sesiones por número
  const sortedSessions = [...sessions].sort((a, b) => a.number - b.number)

  const getAttendanceStatus = (studentId: string, sessionId: string) => {
    return attendance.find((record) => record.studentId === studentId && record.sessionId === sessionId)
  }

  const getStatusCell = (status: AttendanceRecord | undefined) => {
    if (!status) return <span className="text-muted-foreground">-</span>

    const statusMap: Record<AttendanceStatus, { text: string; class: string }> = {
      PRESENT: { text: "Presente", class: "text-green-500" },
      ABSENT: { text: "Ausente", class: "text-red-500" },
      JUSTIFIED: { text: "Justificado", class: "text-yellow-500 cursor-pointer hover:underline" },
    }

    const statusInfo = statusMap[status.status]

    if (status.status === "JUSTIFIED" && status.justification) {
      return (
        <span
          className={statusInfo.class}
          onClick={() => {
            setSelectedJustification(status.justification || "")
            setShowJustification(true)
          }}
          title="Click para ver justificación"
        >
          {statusInfo.text}
        </span>
      )
    }

    return <span className={statusInfo.class}>{statusInfo.text}</span>
  }

  const exportToCSV = () => {
    // Crear encabezados
    const headers = ["agorense"]
    sortedSessions.forEach((session) => {
      
    })

    // Crear filas
    const rows = students.map((student) => {
      const row = [student.name]
      sortedSessions.forEach((session) => {
        const status = getAttendanceStatus(student.id, session.id)
        const statusMap: Record<AttendanceStatus, string> = {
          PRESENT: "Presente",
          ABSENT: "Ausente",
          JUSTIFIED: "Justificado",
        }
        row.push(status ? statusMap[status.status] : "-")
      })
      return row
    })

    // Combinar todo en CSV
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")

    // Descargar archivo
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "asistencia.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vista General de Asistencia</CardTitle>
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
              <CardTitle>Vista General de Asistencia</CardTitle>
              <CardDescription>Vista completa de asistencia por encuentro</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="bg-background sticky left-0 min-w-[200px]">agorense</TableHead>
                  {sortedSessions.map((session) => (
                    <TableHead key={session.id} className="text-center min-w-[150px]">
                      <div className="font-bold">Encuentro {session.number}</div>
                      <div className="text-xs text-muted-foreground">{session.name}</div>
                      <div className="text-xs text-muted-foreground">Parte {session.part}</div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="bg-background sticky left-0 font-medium">{student.name}</TableCell>
                    {sortedSessions.map((session) => (
                      <TableCell key={session.id} className="text-center">
                        {getStatusCell(getAttendanceStatus(student.id, session.id))}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
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

