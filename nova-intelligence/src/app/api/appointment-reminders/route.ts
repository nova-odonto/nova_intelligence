import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const day = searchParams.get('day') // 'tomorrow' ou 'today'

  const now = new Date()
  const target = new Date(now)

  if (day === 'tomorrow') {
    target.setDate(target.getDate() + 1)
  }

  // Início e fim do dia alvo em UTC-3
  const startOfDay = new Date(target)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(target)
  endOfDay.setHours(23, 59, 59, 999)

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId: CLINIC_ID,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startAt: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { name: true } },
    },
    orderBy: { startAt: 'asc' }
  })

  // Filtra só quem tem telefone
  const eligible = appointments.filter(a => a.patient?.phone)

  return NextResponse.json(eligible.map(a => ({
    appointmentId: a.id,
    patientName: a.patient.name,
    phone: a.patient.phone,
    type: a.type,
    dentistName: a.dentist?.name ?? null,
    startAt: a.startAt,
    time: new Date(a.startAt).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Araguaina'
    })
  })))
}