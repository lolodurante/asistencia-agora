import { Suspense } from "react"
import { getStudents, getSessions, getAttendance } from "@/lib/actions"
import ClientPage from "@/components/client-page"

export default async function Home() {
  const [students, sessions, attendance] = await Promise.all([
    getStudents(),
    getSessions(),
    getAttendance()
  ])

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ClientPage
        initialStudents={students}
        initialSessions={sessions}
        initialAttendance={attendance}
      />
    </Suspense>
  )
}

