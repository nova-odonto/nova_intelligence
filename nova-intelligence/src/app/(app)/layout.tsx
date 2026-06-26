// src/app/(app)/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { Sidebar } from '@/components/layout/sidebar'
import { SessionProvider } from '@/components/providers/session-provider'
import { NotificationToast } from '@/components/layout/NotificationToast'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-[#F8F7F5]">
        <Sidebar />
        <div className="md:ml-60 pt-14 md:pt-0 min-h-screen">
          {children}
        </div>
        <NotificationToast />
      </div>
    </SessionProvider>
  )
}