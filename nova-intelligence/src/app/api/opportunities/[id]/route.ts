import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['ACTIVE', 'WON', 'LOST', 'RECOVERED']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const now = new Date()
  const opp = await prisma.opportunity.update({
    where: { id },
    data: {
      status,
      ...(status === 'WON'       && { wonAt: now }),
      ...(status === 'LOST'      && { lostAt: now }),
      ...(status === 'RECOVERED' && { recoveredAt: now }),
      lastContactAt: now,
    },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      leadSource: { select: { name: true } },
    }
  })

  return NextResponse.json(opp)
}