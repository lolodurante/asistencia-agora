import { Suspense } from "react"
import { getStudents, getSessions, getAttendance, getSettings } from "@/lib/actions"
import ClientPage from "@/components/client-page"

export default async function Home() {
  const [students, sessions, attendance, settings] = await Promise.all([
    getStudents(),
    getSessions(),
    getAttendance(),
    getSettings()
  ])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPage
        initialStudents={students}
        initialSessions={sessions}
        initialAttendance={attendance}
        settings={settings}
      />
    </Suspense>
  )
}

