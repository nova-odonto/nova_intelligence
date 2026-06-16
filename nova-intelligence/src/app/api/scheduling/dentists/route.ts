import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId')

  if (!clinicId) {
    return NextResponse.json({ error: 'Missing clinicId' }, { status: 400 })
  }

  const dentists = await prisma.dentist.findMany({
    where: { clinicId },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(dentists)
}