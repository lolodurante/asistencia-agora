"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface SettingsPanelProps {
  totalSessions: number
  setTotalSessions: React.Dispatch<React.SetStateAction<number>>
  attendanceThreshold: number
  setAttendanceThreshold: React.Dispatch<React.SetStateAction<number>>
}

export default function SettingsPanel({
  totalSessions,
  setTotalSessions,
  attendanceThreshold,
  setAttendanceThreshold,
}: SettingsPanelProps) {
  const [newTotalSessions, setNewTotalSessions] = useState(totalSessions.toString())
  const [newFirstPartSessions, setNewFirstPartSessions] = useState(Math.ceil(totalSessions / 2).toString())
  const [newAttendanceThreshold, setNewAttendanceThreshold] = useState(attendanceThreshold.toString())
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    const savedFirstPart = localStorage.getItem("firstPartSessions")
    if (savedFirstPart) {
      setNewFirstPartSessions(savedFirstPart)
    }
  }, [])

  const handleSave = () => {
    const parsedTotal = Number.parseInt(newTotalSessions)
    const parsedFirstPart = Number.parseInt(newFirstPartSessions)
    const parsedThreshold = Number.parseInt(newAttendanceThreshold)

    if (!isNaN(parsedTotal) && parsedTotal > 0) {
      setTotalSessions(parsedTotal)
    }

    if (!isNaN(parsedFirstPart) && parsedFirstPart > 0 && parsedFirstPart <= parsedTotal) {
      localStorage.setItem("firstPartSessions", parsedFirstPart.toString())
    }

    if (!isNaN(parsedThreshold) && parsedThreshold >= 0 && parsedThreshold <= 100) {
      setAttendanceThreshold(parsedThreshold)
    }
  }

  const resetAllData = () => {
    localStorage.clear()
    window.location.reload()
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Ajusta los parámetros generales del sistema de asistencia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="totalSessions">Número total de encuentros</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="totalSessions"
                  type="number"
                  min="1"
                  value={newTotalSessions}
                  onChange={(e) => setNewTotalSessions(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="firstPartSessions">Encuentros en la primera parte</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="firstPartSessions"
                  type="number"
                  min="1"
                  max={newTotalSessions}
                  value={newFirstPartSessions}
                  onChange={(e) => setNewFirstPartSessions(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="attendanceThreshold">Porcentaje mínimo de asistencia requerido (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="attendanceThreshold"
                  type="number"
                  min="0"
                  max="100"
                  value={newAttendanceThreshold}
                  onChange={(e) => setNewAttendanceThreshold(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Los estudiantes deben alcanzar este porcentaje en cada parte para aprobar.
              </p>
            </div>

            <Button onClick={handleSave} className="mt-4">
              Guardar Configuración
            </Button>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Información</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>
                  Primera parte: Encuentros 1 al {Number.parseInt(newFirstPartSessions) || Math.ceil(totalSessions / 2)}
                </li>
                <li>
                  Segunda parte: Encuentros{" "}
                  {(Number.parseInt(newFirstPartSessions) || Math.ceil(totalSessions / 2)) + 1} al {totalSessions}
                </li>
                <li>Límite de asistencia: {newAttendanceThreshold}% en cada parte</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos y Reinicio</CardTitle>
          <CardDescription>Opciones para reiniciar o exportar los datos del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Reiniciar todos los datos</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente todos los datos: estudiantes, encuentros y registros de
                    asistencia. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={resetAllData}>Sí, eliminar todo</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <p className="text-sm text-muted-foreground">
              El reinicio eliminará todos los datos almacenados localmente en este navegador.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

