import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function POST(req: NextRequest) {
  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'Phone obrigatório' }, { status: 400 })

  const clean = phone.replace(/\D/g, '').replace(/^55/, '')

  const patient = await prisma.patient.findFirst({
    where: {
      clinicId: CLINIC_ID,
      phone: { contains: clean }
    }
  })

  if (!patient) {
    return NextResponse.json({ message: 'Paciente não encontrado' }, { status: 404 })
  }

  // Atualiza lastContactAt em todas oportunidades ACTIVE do paciente
  const updated = await prisma.opportunity.updateMany({
    where: {
      patientId: patient.id,
      clinicId: CLINIC_ID,
      status: 'ACTIVE'
    },
    data: { lastContactAt: new Date() }
  })

  return NextResponse.json({ ok: true, patientId: patient.id, opportunitiesUpdated: updated.count })
}