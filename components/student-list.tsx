"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UserPlus, Trash2, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createStudent, deleteStudent } from "@/lib/actions"
import type { Student, Session, AttendanceRecord } from "@/lib/db"

interface StudentListProps {
  students: Student[]
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>
  sessions: Session[]
  attendance: AttendanceRecord[]
  totalSessions: number
  attendanceThreshold: number
}

export default function StudentList({
  students,
  setStudents,
  sessions,
  attendance,
  attendanceThreshold,
}: StudentListProps) {
  const [newStudentName, setNewStudentName] = useState("")
  const [showJustificationsDialog, setShowJustificationsDialog] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)

  const addStudent = async () => {
    if (!newStudentName.trim()) return

    try {
      const newStudent = await createStudent(newStudentName.trim())
      setStudents((prev) => [...prev, newStudent])
      setNewStudentName("")
    } catch (error) {
      console.error("Error adding student:", error)
    }
  }

  const removeStudent = async (id: string) => {
    try {
      await deleteStudent(id)
      setStudents((prev) => prev.filter((student) => student.id !== id))
    } catch (error) {
      console.error("Error removing student:", error)
    }
  }

  const calculateAttendancePercentage = (studentId: string, part: 1 | 2): number => {
    const partSessions = sessions.filter((session) => session.part === part)

    let sessionsWithAnyRecordForStudent = 0
    const presentCount = partSessions.reduce((count, session) => {
      const record = attendance.find((r) => r.studentId === studentId && r.sessionId === session.id)
      if (record) {
        sessionsWithAnyRecordForStudent++
        if (record.status === "PRESENT") {
          return count + 1
        }
      }
      return count
    }, 0)

    if (sessionsWithAnyRecordForStudent === 0) {
      return 0
    }

    return Math.round((presentCount / sessionsWithAnyRecordForStudent) * 100)
  }

  const isAtRisk = (studentId: string): boolean => {
    const part1Percentage = calculateAttendancePercentage(studentId, 1)
    const part2Percentage = calculateAttendancePercentage(studentId, 2)

    const part1HasSessions = sessions.some((s) => s.part === 1)
    const part2HasSessions = sessions.some((s) => s.part === 2)

    return (
      (part1HasSessions && part1Percentage < attendanceThreshold) ||
      (part2HasSessions && part2Percentage < attendanceThreshold)
    )
  }

  const getAttendanceColor = (percentage: number): string => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= attendanceThreshold) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getJustifications = (studentId: string) => {
    return attendance
      .filter((record) => record.studentId === studentId && record.status === "JUSTIFIED")
      .map((record) => {
        const session = sessions.find((s) => s.id === record.sessionId)
        return {
          session,
          justification: record.justification ?? "",
        }
      })
  }

  const selectedStudent = students.find((s) => s.id === selectedStudentId)
  const justifications = selectedStudentId ? getJustifications(selectedStudentId) : []

  const handleCloseDialog = () => {
    const closeButton = document.querySelector("[data-radix-dialog-close]") as HTMLButtonElement | null
    closeButton?.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>agorenses</CardTitle>
        <CardDescription>Administra la lista de agorenses y visualiza su asistencia</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <Input
            placeholder="Nombre del agorense"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addStudent()}
          />
          <Button onClick={addStudent}>
            <UserPlus className="mr-2 h-4 w-4" /> Agregar
          </Button>
        </div>

        {students.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Primera Parte</TableHead>
                <TableHead>Segunda Parte</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const part1Percentage = calculateAttendancePercentage(student.id, 1)
                const part2Percentage = calculateAttendancePercentage(student.id, 2)
                const atRisk = isAtRisk(student.id)
                const hasJustifications = getJustifications(student.id).length > 0

                return (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={part1Percentage} className={getAttendanceColor(part1Percentage)} />
                        <p className="text-xs text-muted-foreground">{part1Percentage}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={part2Percentage} className={getAttendanceColor(part2Percentage)} />
                        <p className="text-xs text-muted-foreground">{part2Percentage}%</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {atRisk ? (
                        <Badge variant="destructive">En riesgo</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          Regular
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {hasJustifications && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setSelectedStudentId(student.id)
                              setShowJustificationsDialog(true)
                            }}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        )}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Eliminar agorense</DialogTitle>
                              <DialogDescription>
                                ¿Estás seguro que deseas eliminar a {student.name}? Esta acción no se puede deshacer.
                              </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                              <Button variant="outline" onClick={handleCloseDialog}>
                                Cancelar
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={async () => {
                                  await removeStudent(student.id)
                                  handleCloseDialog()
                                }}
                              >
                                Eliminar
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No hay agorenses registrados.</p>
            <p className="text-sm text-muted-foreground mt-1">Agrega agorenses usando el formulario de arriba.</p>
          </div>
        )}
      </CardContent>

      <Dialog open={showJustificationsDialog} onOpenChange={setShowJustificationsDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Justificaciones de {selectedStudent?.name}</DialogTitle>
            <DialogDescription>
              Lista de justificaciones presentadas por el agorense
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {justifications.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sesión</TableHead>
                    <TableHead>Justificación</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {justifications.map(({ session, justification }) => (
                    <TableRow key={session?.id}>
                      <TableCell>
                        {session?.name || `Sesión ${session?.number}`} (Parte {session?.part})
                      </TableCell>
                      <TableCell>{justification}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay justificaciones registradas.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

