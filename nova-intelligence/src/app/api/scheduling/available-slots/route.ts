import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes, format, setHours, setMinutes } from 'date-fns'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dentistId = searchParams.get('dentistId')
  const date = searchParams.get('date') // "2026-06-15"
  const duration = parseInt(searchParams.get('duration') || '30')

  if (!dentistId || !date) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const dayOfWeek = new Date(date).getDay()

  const schedule = await prisma.workSchedule.findFirst({
    where: { dentistId, dayOfWeek }
  })

  if (!schedule) {
    return NextResponse.json({ slots: [] })
  }

  const dayStart = new Date(`${date}T00:00:00`)
  const dayEnd = new Date(`${date}T23:59:59`)

  const existing = await prisma.appointment.findMany({
    where: {
      dentistId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startAt: { gte: dayStart, lte: dayEnd }
    }
  })

  const slots: string[] = []
  const [startH, startM] = schedule.startTime.split(':').map(Number)
  const [endH, endM] = schedule.endTime.split(':').map(Number)

  let current = setMinutes(setHours(new Date(date), startH), startM)
  const end = setMinutes(setHours(new Date(date), endH), endM)

  while (addMinutes(current, duration) <= end) {
    const slotEnd = addMinutes(current, duration)
    const occupied = existing.some(
      appt => current < appt.endAt && slotEnd > appt.startAt
    )
    if (!occupied) slots.push(format(current, 'HH:mm'))
    current = addMinutes(current, schedule.slotMinutes)
  }

  return NextResponse.json({ slots, date, dentistId })
}