import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format, addDays, nextMonday } from 'date-fns'

export async function POST(req: NextRequest) {
  const { message, clinicId, dentistId } = await req.json()

  // Busca slots disponíveis dos próximos 7 dias
  const availableSlots: { date: string; slots: string[] }[] = []

  for (let i = 1; i <= 7; i++) {
    const day = addDays(new Date(), i)
    const date = format(day, 'yyyy-MM-dd')

    if (dentistId) {
      const res = await fetch(
        `${process.env.NEXTAUTH_URL}/api/scheduling/available-slots?dentistId=${dentistId}&date=${date}`
      )
      if (res.ok) {
        const data = await res.json()
        if (data.slots.length > 0) {
          availableSlots.push({ date, slots: data.slots })
        }
      }
    }
  }

  const slotsText = availableSlots.length > 0
    ? availableSlots.map(d => `${d.date}: ${d.slots.join(', ')}`).join('\n')
    : 'Nenhum slot disponível encontrado nos próximos 7 dias.'

  // Chama n8n webhook
  const n8nUrl = process.env.N8N_WEBHOOK_SCHEDULING

  if (!n8nUrl) {
    return NextResponse.json({ error: 'N8N webhook não configurado' }, { status: 500 })
  }

  const n8nRes = await fetch(n8nUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      availableSlots: slotsText,
      today: format(new Date(), 'yyyy-MM-dd')
    })
  })

  const n8nData = await n8nRes.json()

  return NextResponse.json({
    suggestion: n8nData.suggestion || n8nData.text || 'Não foi possível processar a sugestão.',
    date: n8nData.date || null,
    time: n8nData.time || null
  })
}