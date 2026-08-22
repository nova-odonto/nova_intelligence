import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes, addDays, endOfWeek } from 'date-fns'
import { validateInternalSecret } from '@/lib/internal-auth'

const DENTIST_ID = 'cmqekbxiu0008tulgyypfpqdv'
const SLOT_DURATION = 30
const TZ_OFFSET = '-03:00'

async function getSlotsForDate(date: string, dentistId: string): Promise<string[]> {
  const dayOfWeek = new Date(date + 'T12:00:00').getDay()
  const schedule = await prisma.workSchedule.findFirst({ where: { dentistId, dayOfWeek } })
  if (!schedule) return []

  // Sempre usar offset explícito -03:00 (Brasília), igual ao /api/whatsapp/book.
  // new Date(date)/setHours dependem do fuso do servidor (Vercel roda em UTC),
  // o que causava um desalinhamento de 3h entre disponibilidade e agendamentos reais.
  const dayStart = new Date(`${date}T00:00:00${TZ_OFFSET}`)
  const dayEnd = new Date(`${date}T23:59:59${TZ_OFFSET}`)

  const existing = await prisma.appointment.findMany({
    where: { dentistId, status: { in: ['SCHEDULED', 'CONFIRMED'] }, startAt: { gte: dayStart, lte: dayEnd } }
  })

  const slots: string[] = []
  const [startH, startM] = schedule.startTime.split(':').map(Number)
  const [endH, endM] = schedule.endTime.split(':').map(Number)

  let currentMinutes = startH * 60 + startM
  const endMinutes = endH * 60 + endM

  while (currentMinutes + SLOT_DURATION <= endMinutes) {
    const label = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`
    const current = new Date(`${date}T${label}:00${TZ_OFFSET}`)
    const slotEnd = addMinutes(current, SLOT_DURATION)
    const occupied = existing.some(a => current < a.endAt && slotEnd > a.startAt)
    if (!occupied) slots.push(label)
    currentMinutes += schedule.slotMinutes
  }

  return slots
}

export async function GET(req: NextRequest) {
  const authError = validateInternalSecret(req)
  if (authError) return authError

  const now = new Date()
  // Extrai data/hora "de parede" em Brasília sem depender do fuso do servidor
  // (Vercel roda em UTC): desloca o instante e lê os métodos UTC do resultado.
  const nowBrasilia = new Date(now.getTime() - 3 * 60 * 60 * 1000)
  const today = `${nowBrasilia.getUTCFullYear()}-${String(nowBrasilia.getUTCMonth() + 1).padStart(2, '0')}-${String(nowBrasilia.getUTCDate()).padStart(2, '0')}`
  const horaAtual = nowBrasilia.getUTCHours() * 60 + nowBrasilia.getUTCMinutes()

  const dates: string[] = []
  for (let i = 0; i < 14; i++) {
    const d = new Date(nowBrasilia.getTime() + i * 24 * 60 * 60 * 1000)
    dates.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`)
  }

  const semanaAtualFim = endOfWeek(now, { weekStartsOn: 1 })
  const semanaProximaFim = endOfWeek(addDays(semanaAtualFim, 1), { weekStartsOn: 1 })

  const slotsAtual: { date: string; slot: string }[] = []
  const slotsProxima: { date: string; slot: string }[] = []

  for (const date of dates) {
    const dateObj = new Date(date + 'T12:00:00')
    const slots = await getSlotsForDate(date, DENTIST_ID)

    const slotsValidos = date === today
      ? slots.filter(s => { const [h, m] = s.split(':').map(Number); return (h * 60 + m) > horaAtual + 30 })
      : slots

    if (slotsValidos.length === 0) continue

    if (dateObj <= semanaAtualFim) {
      if (slotsAtual.length < 2) slotsAtual.push({ date, slot: slotsValidos[0] })
    } else if (dateObj <= semanaProximaFim) {
      if (slotsProxima.length < 2) slotsProxima.push({ date, slot: slotsValidos[0] })
    }

    if (slotsAtual.length >= 2 && slotsProxima.length >= 2) break
  }

  return NextResponse.json({ semanaAtual: slotsAtual, proximaSemana: slotsProxima, dentistId: DENTIST_ID, geradoEm: now.toISOString() })
}