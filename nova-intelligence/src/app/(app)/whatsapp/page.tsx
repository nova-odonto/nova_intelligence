// src/app/(app)/whatsapp/page.tsx
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { prisma } from '@/lib/prisma'
import WhatsappClient from './whatsapp-client'

export default async function WhatsappPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) redirect('/login')

  const conversations = await prisma.whatsappConversation.findMany({
    where: { clinicId: 'demo' },
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = conversations.map((c) => {
    const messages = c.messages as any[]
    const last = messages[messages.length - 1]
    const unread = messages.filter((m) => m.role === 'user' && !m.read).length

    return {
      id: c.id,
      phone: c.phone,
      lastMessage: last?.content ?? '',
      lastMessageAt: c.updatedAt.toISOString(),
      unread,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    }
  })

  return <WhatsappClient conversations={serialized} role={session.user.role} />
}