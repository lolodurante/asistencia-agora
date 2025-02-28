"use client"

import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { updateSettings } from "@/lib/actions"
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
  firstPartSessions: number
  attendanceThreshold: number
}

export default function SettingsPanel({
  totalSessions,
  firstPartSessions,
  attendanceThreshold,
}: SettingsPanelProps) {
  const [newTotalSessions, setNewTotalSessions] = useState(totalSessions.toString())
  const [newFirstPartSessions, setNewFirstPartSessions] = useState(firstPartSessions.toString())
  const [newAttendanceThreshold, setNewAttendanceThreshold] = useState(attendanceThreshold.toString())
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleSave = async () => {
    const parsedTotal = Number.parseInt(newTotalSessions)
    const parsedFirstPart = Number.parseInt(newFirstPartSessions)
    const parsedThreshold = Number.parseInt(newAttendanceThreshold)

    if (
      !isNaN(parsedTotal) && parsedTotal > 0 &&
      !isNaN(parsedFirstPart) && parsedFirstPart > 0 && parsedFirstPart <= parsedTotal &&
      !isNaN(parsedThreshold) && parsedThreshold >= 0 && parsedThreshold <= 100
    ) {
      await updateSettings({
        totalSessions: parsedTotal,
        firstPartSessions: parsedFirstPart,
        attendanceThreshold: parsedThreshold
      })
    }
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
                Los agorenses deben alcanzar este porcentaje en cada parte para aprobar.
              </p>
            </div>

            <Button onClick={handleSave} className="mt-4">
              Guardar Configuración
            </Button>

            <div className="pt-4">
              <h3 className="text-sm font-medium mb-2">Información</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                <li>Primera parte: Encuentros 1 al {newFirstPartSessions}</li>
                <li>Segunda parte: Encuentros {Number(newFirstPartSessions) + 1} al {newTotalSessions}</li>
                <li>Límite de asistencia: {newAttendanceThreshold}% en cada parte</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

