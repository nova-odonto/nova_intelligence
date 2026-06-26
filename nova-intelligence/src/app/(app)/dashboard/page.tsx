// src/app/(app)/dashboard/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import DashboardClient from './dashboard-client'

function shouldSeeBriefing(lastBriefingAt: Date | null): boolean {
  if (!lastBriefingAt) return true
  const today = new Date()
  return (
    lastBriefingAt.getDate() !== today.getDate() ||
    lastBriefingAt.getMonth() !== today.getMonth() ||
    lastBriefingAt.getFullYear() !== today.getFullYear()
  )
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  if (session.user.role === 'OWNER') {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { lastBriefingAt: true },
    })

    if (shouldSeeBriefing(user?.lastBriefingAt ?? null)) {
      redirect('/briefing')
    }
  }

  return <DashboardClient role={session.user.role} name={session.user.name ?? ''} />
}