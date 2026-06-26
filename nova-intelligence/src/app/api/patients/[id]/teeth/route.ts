import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const teeth = await prisma.toothRecord.findMany({
    where: { patientId: id },
    orderBy: { toothNumber: 'asc' }
  })
  return NextResponse.json(teeth)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { toothNumber, status, description, notes } = await req.json()

  const record = await prisma.toothRecord.upsert({
    where: { patientId_toothNumber: { patientId: id, toothNumber } },
    update: { status, description, notes },
    create: { patientId: id, clinicId: CLINIC_ID, toothNumber, status, description, notes }
  })

  return NextResponse.json(record)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { toothNumber } = await req.json()

  await prisma.toothRecord.deleteMany({
    where: { patientId: id, toothNumber }
  })

  return NextResponse.json({ ok: true })
}