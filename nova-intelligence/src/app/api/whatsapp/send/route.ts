import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function POST(req: NextRequest) {
  const { phone, message } = await req.json()

  if (!phone || !message) {
    return NextResponse.json({ error: 'phone e message obrigatórios' }, { status: 400 })
  }

  const res = await fetch(
    `${process.env.EVOLUTION_API_URL}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: process.env.EVOLUTION_API_KEY!,
      },
      body: JSON.stringify({ number: phone, text: message }),
    }
  )

  if (!res.ok) {
    return NextResponse.json({ error: 'Falha ao enviar' }, { status: 502 })
  }

  const conversation = await prisma.whatsappConversation.findFirst({
    where: { phone, clinicId: CLINIC_ID },
  })

  const newMessage = { role: 'assistant', content: message, createdAt: new Date().toISOString() }

  if (conversation) {
    const messages = conversation.messages as any[]
    await prisma.whatsappConversation.update({
      where: { id: conversation.id },
      data: { messages: [...messages, newMessage] },
    })
  }

  return NextResponse.json({ ok: true })
}