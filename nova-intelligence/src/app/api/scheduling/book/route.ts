import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes } from 'date-fns'

export async function POST(req: NextRequest) {
  const { patientId, dentistId, clinicId, date, time, type, createdViaAI } = await req.json()

  const startAt = new Date(`${date}T${time}:00-03:00`)
  const endAt = addMinutes(startAt, 30)

  const conflict = await prisma.appointment.findFirst({
    where: {
      dentistId,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startAt: { lt: endAt },
      endAt: { gt: startAt }
    }
  })

  if (conflict) {
    return NextResponse.json({ error: 'Horário não disponível' }, { status: 409 })
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId,
      dentistId,
      clinicId,
      startAt,
      endAt,
      type: type || 'consulta',
      createdViaAI: !!createdViaAI,
      status: 'SCHEDULED'
    },
    include: {
      patient: { select: { name: true } },
      dentist: { select: { name: true } }
    }
  })

  return NextResponse.json(appointment, { status: 201 })
}