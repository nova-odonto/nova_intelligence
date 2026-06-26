import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId') || CLINIC_ID

  const notifications = await prisma.notification.findMany({
    where: { clinicId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  const unreadCount = await prisma.notification.count({
    where: { clinicId, read: false }
  })

  return NextResponse.json({ notifications, unreadCount })
}

export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId') || CLINIC_ID

  await prisma.notification.updateMany({
    where: { clinicId, read: false },
    data: { read: true }
  })

  return NextResponse.json({ ok: true })
}