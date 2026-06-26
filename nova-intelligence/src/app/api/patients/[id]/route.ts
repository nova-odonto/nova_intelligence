import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      leadSource: { select: { name: true } },
      appointments: {
        orderBy: { startAt: 'desc' },
        include: { dentist: { select: { name: true, specialty: true } } }
      },
      opportunities: {
        orderBy: { createdAt: 'desc' },
        include: { leadSource: { select: { name: true } } }
      },
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      anamnesis: true,
      toothRecords: { orderBy: { toothNumber: 'asc' } },
    }
  })

  if (!patient) {
    return NextResponse.json({ error: 'Paciente não encontrado' }, { status: 404 })
  }

  return NextResponse.json(patient)
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      name: body.name,
      phone: body.phone,
      email: body.email,
      cpf: body.cpf,
      birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
    }
  })

  return NextResponse.json(patient)
}