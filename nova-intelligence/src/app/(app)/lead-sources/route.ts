import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId') || CLINIC_ID

  const sources = await prisma.leadSource.findMany({
    where: { clinicId },
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(sources)
}