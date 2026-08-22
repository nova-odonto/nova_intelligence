import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyClients } from '@/lib/sse'
import { validateInternalSecret } from '@/lib/internal-auth'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const authError = validateInternalSecret(req)
  if (authError) return authError

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
    .slice(-20)
    .map((m: any) => `${m.role === 'user' ? 'Paciente' : 'Mari'}: ${m.content}`)
    .join('\n')

  return NextResponse.json({ historico })
}

export async function DELETE(req: NextRequest) {
  const authError = validateInternalSecret(req)
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const phone = searchParams.get('phone')
  if (!phone) return NextResponse.json({ error: 'Missing phone' }, { status: 400 })

  const result = await prisma.whatsappConversation.deleteMany({
    where: { phone, clinicId: CLINIC_ID }
  })

  return NextResponse.json({ ok: true, deleted: result.count })
}

export async function POST(req: NextRequest) {
  const authError = validateInternalSecret(req)
  if (authError) return authError

  const { phone, role, content, assistantContent } = await req.json()

  const existing = await prisma.whatsappConversation.findFirst({
    where: { phone, clinicId: CLINIC_ID }
  })

  const userMessage = { role, content, createdAt: new Date().toISOString() }
  const assistantMessage = assistantContent
    ? { role: 'assistant', content: assistantContent, createdAt: new Date().toISOString() }
    : null

  const newMessages = assistantMessage ? [userMessage, assistantMessage] : [userMessage]

  if (existing) {
    const messages = existing.messages as any[]
    await prisma.whatsappConversation.update({
      where: { id: existing.id },
      data: { messages: [...messages, ...newMessages] }
    })
  } else {
    await prisma.whatsappConversation.create({
      data: { phone, clinicId: CLINIC_ID, messages: newMessages }
    })
  }

  notifyClients(CLINIC_ID, { type: 'new_message', phone, role, content, createdAt: userMessage.createdAt })

  if (assistantMessage) {
    notifyClients(CLINIC_ID, { type: 'new_message', phone, role: 'assistant', content: assistantContent, createdAt: assistantMessage.createdAt })
  }

  return NextResponse.json({ ok: true })
}