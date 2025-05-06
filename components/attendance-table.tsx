"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, X, AlertCircle, Trash2 } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { createSession, updateAttendance, deleteSession } from "@/lib/actions"
import { Student, Session, AttendanceRecord } from "@/lib/db"

interface AttendanceTableProps {
  students: Student[]
  sessions: Session[]
  attendance: AttendanceRecord[]
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>
  totalSessions: number
  firstPartSessions: number
}

export default function AttendanceTable({
  students,
  sessions,
  attendance,
  setAttendance,
  setSessions,
  totalSessions,
  firstPartSessions,
}: AttendanceTableProps) {
  const [selectedSession, setSelectedSession] = useState<string | null>(null)
  const [newSessionName, setNewSessionName] = useState("")
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false)
  const [showJustificationDialog, setShowJustificationDialog] = useState(false)
  const [justificationText, setJustificationText] = useState("")
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  // Calculate the next session number and part
  const getNextSessionInfo = () => {
    if (sessions.length === 0) {
      return { number: 1, part: 1 as const }
    }

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

  const handleConfirmNewSession = async () => {
    if (!newSessionName.trim()) return

    const { number, part } = getNextSessionInfo()
    try {
      const newSession = await createSession({
        date: new Date(),
        part,
        number,
        name: newSessionName.trim()
      })

      setSessions((prev) => [...prev, newSession])
      setSelectedSession(newSession.id)
      setNewSessionName("")
      setShowNewSessionDialog(false)
    } catch (error) {
      console.error("Error creating session:", error)
    }
  }

  const handleAttendanceChange = async (studentId: string, status: "PRESENT" | "ABSENT" | "JUSTIFIED") => {
    if (!selectedSession) return

    if (status === "JUSTIFIED") {
      setSelectedStudent(studentId)
      setJustificationText("")
      setShowJustificationDialog(true)
      return
    }

    try {
      const updatedRecord = await updateAttendance({
        studentId,
        sessionId: selectedSession,
        status
      })

      setAttendance((prev) => {
        const filtered = prev.filter(
          (record) => !(record.studentId === studentId && record.sessionId === selectedSession),
        )
        return [...filtered, updatedRecord]
      })
    } catch (error) {
      console.error("Error updating attendance:", error)
    }
  }

  const handleJustificationSubmit = async () => {
    if (!selectedSession || !selectedStudent || !justificationText.trim()) return

    try {
      const updatedRecord = await updateAttendance({
        studentId: selectedStudent,
        sessionId: selectedSession,
        status: "JUSTIFIED",
        justification: justificationText.trim()
      })

      setAttendance((prev) => {
        const filtered = prev.filter(
          (record) => !(record.studentId === selectedStudent && record.sessionId === selectedSession),
        )
        return [...filtered, updatedRecord]
      })

      setShowJustificationDialog(false)
      setSelectedStudent(null)
      setJustificationText("")
    } catch (error) {
      console.error("Error updating attendance with justification:", error)
    }
  }

  const getAttendanceStatus = (studentId: string): "PRESENT" | "ABSENT" | "JUSTIFIED" | null => {
    if (!selectedSession) return null

    const record = attendance.find((record) => record.studentId === studentId && record.sessionId === selectedSession)

    return record ? record.status : null
  }

  const getSessionLabel = (session: Session) => {
    return `${session.name || "Sin nombre"}`
  }

  const selectedSessionData = selectedSession ? sessions.find((s) => s.id === selectedSession) : null

  const handleDeleteSession = async () => {
    if (!selectedSession) return
    
    try {
      await deleteSession(selectedSession)
      
      // Update local state by removing the deleted session
      setSessions((prev) => prev.filter((session) => session.id !== selectedSession))
      
      // Remove related attendance records from state
      setAttendance((prev) => prev.filter((record) => record.sessionId !== selectedSession))
      
      // Clear selection
      setSelectedSession(null)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Error deleting session:", error)
      alert("Error al eliminar el encuentro. Intente nuevamente.")
    }
  }

  return (
    <>
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Asistencia</CardTitle>
          <CardDescription className="mt-1">
            Selecciona un encuentro existente o crea uno nuevo para registrar la asistencia
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
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
            <Button onClick={handleCreateNewSession} disabled={sessions.length >= totalSessions} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Encuentro
            </Button>
          </div>

          {selectedSessionData && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="outline" className="mb-2">
                    {selectedSessionData.part === 1 ? "Primera Parte" : "Segunda Parte"}
                  </Badge>
                  <h3 className="text-lg font-medium">
                    {selectedSessionData.name}
                  </h3>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                </Button>
              </div>
            </div>
          )}

          {selectedSession ? (
            students.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">agorense</TableHead>
                      <TableHead className="min-w-[100px]">Estado</TableHead>
                      <TableHead className="min-w-[150px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const status = getAttendanceStatus(student.id)

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            {status === "PRESENT" && <Badge className="bg-green-500">Presente</Badge>}
                            {status === "ABSENT" && <Badge className="bg-red-500">Ausente</Badge>}
                            {status === "JUSTIFIED" && <Badge className="bg-yellow-500">Justificado</Badge>}
                            {!status && <Badge variant="outline">Sin registrar</Badge>}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                size="sm"
                                variant={status === "PRESENT" ? "default" : "outline"}
                                onClick={() => handleAttendanceChange(student.id, "PRESENT")}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={status === "ABSENT" ? "default" : "outline"}
                                onClick={() => handleAttendanceChange(student.id, "ABSENT")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={status === "JUSTIFIED" ? "default" : "outline"}
                                onClick={() => handleAttendanceChange(student.id, "JUSTIFIED")}
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
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hay agorenses registrados.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Agrega agorenses en la pestaña "agorenses" para poder tomar asistencia.
                </p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Selecciona un encuentro para tomar asistencia.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuevo Encuentro</DialogTitle>
            <DialogDescription>
              Crea un nuevo encuentro para registrar la asistencia de los agorenses
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del encuentro</Label>
              <Input
                id="name"
                placeholder="Ej: Introducción a React"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowNewSessionDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleConfirmNewSession} className="w-full sm:w-auto">Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showJustificationDialog} onOpenChange={setShowJustificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Justificar Inasistencia</DialogTitle>
            <DialogDescription>
              Ingresa el motivo de la inasistencia del agorense
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="justification">Justificación</Label>
              <Textarea
                id="justification"
                placeholder="Ingresa el motivo de la inasistencia..."
                value={justificationText}
                onChange={(e) => setJustificationText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowJustificationDialog(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button onClick={handleJustificationSubmit} className="w-full sm:w-auto">Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este encuentro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el encuentro y todos los registros de asistencia asociados a él.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

