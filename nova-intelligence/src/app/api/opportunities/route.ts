import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId') || CLINIC_ID
  const status = searchParams.get('status')

  const opportunities = await prisma.opportunity.findMany({
    where: {
      clinicId,
      ...(status && { status: status as any })
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      leadSource: { select: { name: true } },
    },
    orderBy: { updatedAt: 'desc' }
  })

  return NextResponse.json(opportunities)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { patientId, treatmentName, estimatedValue, notes, leadSourceId } = body

  if (!patientId || !treatmentName || !estimatedValue) {
    return NextResponse.json({ error: 'Dados obrigatórios faltando' }, { status: 400 })
  }

  const opp = await prisma.opportunity.create({
    data: {
      patientId,
      treatmentName,
      estimatedValue: parseFloat(estimatedValue),
      notes: notes || null,
      leadSourceId: leadSourceId || null,
      clinicId: CLINIC_ID,
      status: 'ACTIVE',
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      leadSource: { select: { name: true } },
    }
  })

  return NextResponse.json(opp, { status: 201 })
}