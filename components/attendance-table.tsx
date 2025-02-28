"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, X, AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

type AttendanceStatus = "present" | "absent" | "justified"

interface AttendanceRecord {
  studentId: string
  sessionId: string
  status: AttendanceStatus
  justification?: string
}

interface AttendanceTableProps {
  students: Student[]
  sessions: Session[]
  attendance: AttendanceRecord[]
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>
  totalSessions: number
}

export default function AttendanceTable({
  students,
  sessions,
  attendance,
  setAttendance,
  setSessions,
  totalSessions,
}: AttendanceTableProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [newSessionName, setNewSessionName] = useState("")
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false)
  const [showJustificationDialog, setShowJustificationDialog] = useState(false)
  const [justificationText, setJustificationText] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)

  // Calculate the next session number and part
  const getNextSessionInfo = () => {
    if (sessions.length === 0) {
      return { number: 1, part: 1 as const }
    }

    const firstPartSessions = Number.parseInt(
      localStorage.getItem("firstPartSessions") || Math.ceil(totalSessions / 2).toString(),
    )
    const currentCount = sessions.length

    if (currentCount < firstPartSessions) {
      return { number: currentCount + 1, part: 1 as const }
    } else if (currentCount < totalSessions) {
      return { number: currentCount + 1, part: 2 as const }
    } else {
      return { number: currentCount + 1, part: 2 as const }
    }
  }

  const handleCreateNewSession = () => {
    setNewSessionName("")
    setShowNewSessionDialog(true)
  }

  const handleConfirmNewSession = () => {
    if (!newSessionName.trim()) return

    const { number, part } = getNextSessionInfo()
    const newSession = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      part,
      number,
      name: newSessionName.trim(),
    }

    setSessions((prev) => [...prev, newSession])
    setSelectedSession(newSession.id)
    setNewSessionName("")
    setShowNewSessionDialog(false)
  }

  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    if (!selectedSession) return

    if (status === "justified") {
      setSelectedStudent(studentId)
      setJustificationText("")
      setShowJustificationDialog(true)
      return
    }

    setAttendance((prev) => {
      const filtered = prev.filter(
        (record) => !(record.studentId === studentId && record.sessionId === selectedSession),
      )

      return [
        ...filtered,
        {
          studentId,
          sessionId: selectedSession,
          status,
        },
      ]
    })
  }

  const handleJustificationSubmit = () => {
    if (!selectedSession || !selectedStudent || !justificationText.trim()) return

    setAttendance((prev) => {
      const filtered = prev.filter(
        (record) => !(record.studentId === selectedStudent && record.sessionId === selectedSession),
      )

      return [
        ...filtered,
        {
          studentId: selectedStudent,
          sessionId: selectedSession,
          status: "justified",
          justification: justificationText.trim(),
        },
      ]
    })

    setShowJustificationDialog(false)
    setSelectedStudent(null)
    setJustificationText("")
  }

  const getAttendanceStatus = (studentId: string): AttendanceStatus | null => {
    if (!selectedSession) return null

    const record = attendance.find((record) => record.studentId === studentId && record.sessionId === selectedSession)

    return record ? record.status : null
  }

  const getSessionLabel = (session: Session) => {
    return `Encuentro ${session.number} (Parte ${session.part}) - ${session.name || "Sin nombre"}`
  }

  const selectedSessionData = selectedSession ? sessions.find((s) => s.id === selectedSession) : null

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Tomar Asistencia</CardTitle>
          <CardDescription>
            Selecciona un encuentro existente o crea uno nuevo para registrar la asistencia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <Select value={selectedSession || ""} onValueChange={setSelectedSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar encuentro" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {getSessionLabel(session)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreateNewSession} disabled={sessions.length >= totalSessions}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo Encuentro
            </Button>
          </div>

          {selectedSessionData && (
            <div className="mb-4">
              <Badge variant="outline" className="mb-2">
                {selectedSessionData.part === 1 ? "Primera Parte" : "Segunda Parte"}
              </Badge>
              <h3 className="text-lg font-medium">
                Encuentro {selectedSessionData.number} - {selectedSessionData.name}
              </h3>
            </div>
          )}

          {selectedSession ? (
            students.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estudiante</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const status = getAttendanceStatus(student.id)

                    return (
                      <TableRow key={student.id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          {status === "present" && <Badge className="bg-green-500">Presente</Badge>}
                          {status === "absent" && <Badge className="bg-red-500">Ausente</Badge>}
                          {status === "justified" && <Badge className="bg-yellow-500">Justificado</Badge>}
                          {!status && <Badge variant="outline">Sin registrar</Badge>}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={status === "present" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(student.id, "present")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "absent" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(student.id, "absent")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant={status === "justified" ? "default" : "outline"}
                              onClick={() => handleAttendanceChange(student.id, "justified")}
                            >
                              <AlertCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay estudiantes registrados.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agrega estudiantes en la pestaña &quot;Estudiantes&quot;.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecciona un encuentro o crea uno nuevo para tomar asistencia.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Encuentro</DialogTitle>
            <DialogDescription>Ingresa un nombre para el nuevo encuentro</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sessionName">Nombre del encuentro</Label>
              <Input
                id="sessionName"
                placeholder="Ej: Clase Teórica 1"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newSessionName.trim()) {
                    handleConfirmNewSession()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSessionDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmNewSession} disabled={!newSessionName.trim()}>
              Crear
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJustificationDialog} onOpenChange={setShowJustificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificación de Falta</DialogTitle>
            <DialogDescription>Ingresa el motivo de la falta justificada</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="justification">Motivo</Label>
              <Textarea
                id="justification"
                placeholder="Ingresa el motivo de la justificación..."
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJustificationDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleJustificationSubmit} disabled={!justificationText.trim()}>
              Guardar Justificación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

