import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const opportunities = await prisma.opportunity.findMany({
    where: {
      clinicId: CLINIC_ID,
      status: 'ACTIVE',
      OR: [
        { lastContactAt: { lte: thirtyDaysAgo } },
        { lastContactAt: null }
      ]
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } }
    },
    orderBy: { lastContactAt: 'asc' },
    take: 50,
  })

  // Filtra só quem tem telefone
  const eligible = opportunities.filter(o => o.patient?.phone)

  return NextResponse.json(eligible.map(o => ({
    opportunityId: o.id,
    patientId: o.patient.id,
    patientName: o.patient.name,
    phone: o.patient.phone,
    treatmentName: o.treatmentName,
    lastContactAt: o.lastContactAt,
  })))
}