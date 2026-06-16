// src/app/(app)/layout.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { Sidebar } from '@/components/layout/sidebar'
import { SessionProvider } from '@/components/providers/session-provider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <SessionProvider session={session}>
      <div className="min-h-screen bg-[#F8F7F5]">
        <Sidebar />
        {/* Desktop: margin-left para sidebar fixa. Mobile: padding-top para topbar fixa */}
        <div className="md:ml-60 pt-14 md:pt-0 min-h-screen">
          {children}
        </div>
      </div>
    </SessionProvider>
  )
}