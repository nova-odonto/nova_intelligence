import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'demo'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')

  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  const conversation = await prisma.whatsappConversation.findFirst({
    where: { phone, clinicId: CLINIC_ID },
    orderBy: { updatedAt: 'desc' }
  })

  if (!conversation) return NextResponse.json({ historico: null })

  const messages = conversation.messages as any[]
  const historico = messages
    .slice(-10)
    .map((m: any) => `${m.role === 'user' ? 'Paciente' : 'IA'}: ${m.content}`)
    .join('\n')

  return NextResponse.json({ historico })
}

export async function POST(req: NextRequest) {
  const { phone, role, content } = await req.json()

  const existing = await prisma.whatsappConversation.findFirst({
    where: { phone, clinicId: CLINIC_ID }
  })

  const newMessage = { role, content, createdAt: new Date().toISOString() }

  if (existing) {
    const messages = existing.messages as any[]
    await prisma.whatsappConversation.update({
      where: { id: existing.id },
      data: { messages: [...messages, newMessage] }
    })
  } else {
    await prisma.whatsappConversation.create({
      data: {
        phone,
        clinicId: CLINIC_ID,
        messages: [newMessage]
      }
    })
  }

  return NextResponse.json({ ok: true })
}