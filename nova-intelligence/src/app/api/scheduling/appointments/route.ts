import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')
  const dentistId = searchParams.get('dentistId')
  const from = searchParams.get('from') // "2026-06-01"
  const to = searchParams.get('to')     // "2026-06-30"

  if (!clinicId) {
    return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
  }

  const appointments = await prisma.appointment.findMany({
    where: {
      clinicId,
      ...(dentistId && { dentistId }),
      ...(from && to && {
        startAt: {
          gte: new Date(`${from}T00:00:00`),
          lte: new Date(`${to}T23:59:59`)
        }
      })
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true, specialty: true } }
    },
    orderBy: { startAt: 'asc' }
  })

  return NextResponse.json(appointments)
}