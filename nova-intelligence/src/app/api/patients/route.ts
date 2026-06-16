import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')

  if (!clinicId) {
    return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
  }

  const patients = await prisma.patient.findMany({
    where: { clinicId },
    select: { id: true, name: true, phone: true },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(patients)
}