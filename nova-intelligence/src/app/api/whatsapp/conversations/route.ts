import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET() {
  const conversations = await prisma.whatsappConversation.findMany({
    where: { clinicId: CLINIC_ID },
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = conversations.map((c) => {
    const messages = c.messages as any[]
    const last = messages[messages.length - 1]

    return {
      id: c.id,
      phone: c.phone,
      lastMessage: last?.content ?? '',
      lastMessageAt: c.updatedAt.toISOString(),
      unread: 0,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        createdAt: m.createdAt,
      })),
    }
  })

  return NextResponse.json(serialized)
}