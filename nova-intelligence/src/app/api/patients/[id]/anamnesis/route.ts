import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const anamnesis = await prisma.anamnesis.findUnique({ where: { patientId: id } })
  return NextResponse.json(anamnesis)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json()

  const anamnesis = await prisma.anamnesis.upsert({
    where: { patientId: id },
    update: { ...body },
    create: { ...body, patientId: id, clinicId: CLINIC_ID },
  })

  return NextResponse.json(anamnesis)
}