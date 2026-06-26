import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinicId') || CLINIC_ID
  const search = searchParams.get('search') || ''
  const risk = searchParams.get('risk') || ''

  const patients = await prisma.patient.findMany({
    where: {
      clinicId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      })
    },
    include: {
      leadSource: { select: { name: true } },
      opportunities: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { treatmentName: true, estimatedValue: true, status: true }
      },
      appointments: {
        orderBy: { startAt: 'desc' },
        take: 5,
        select: {
          id: true, startAt: true, endAt: true,
          type: true, status: true, notes: true,
          dentist: { select: { name: true } }
        }
      },
      interactions: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { createdAt: true, type: true }
      },
      _count: {
        select: { appointments: true, interactions: true }
      }
    },
    orderBy: { name: 'asc' }
  })

  // Calcula risco por paciente
  const now = new Date()
  const enriched = patients.map(p => {
    const lastVisit = p.lastVisitAt
    const neverVisited = !lastVisit
    const daysSince = lastVisit
      ? Math.floor((now.getTime() - new Date(lastVisit).getTime()) / 86400000)
      : null

    let riskLevel: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (neverVisited) riskLevel = 'critical'
    else if (daysSince && daysSince > 365) riskLevel = 'high'
    else if (daysSince && daysSince > 180) riskLevel = 'medium'

    // Override para low se tem oportunidade WON recente
    const latestOpp = p.opportunities[0]
    if (latestOpp?.status === 'WON') riskLevel = 'low'

    return {
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      cpf: p.cpf,
      birthDate: p.birthDate,
      lastVisitAt: p.lastVisitAt,
      createdAt: p.createdAt,
      leadSource: p.leadSource?.name ?? null,
      latestTreatment: latestOpp?.treatmentName ?? null,
      latestValue: latestOpp?.estimatedValue ?? null,
      latestOppStatus: latestOpp?.status ?? null,
      appointments: p.appointments,
      lastInteraction: p.interactions[0]?.createdAt ?? null,
      appointmentCount: p._count.appointments,
      interactionCount: p._count.interactions,
      riskLevel,
      daysSinceVisit: daysSince,
    }
  })

  // Filtro de risco client-driven
  const filtered = risk ? enriched.filter(p => p.riskLevel === risk) : enriched

  const stats = {
    total: enriched.length,
    critical: enriched.filter(p => p.riskLevel === 'critical').length,
    high: enriched.filter(p => p.riskLevel === 'high').length,
    recoverable: enriched.filter(p => ['critical', 'high'].includes(p.riskLevel)).length,
  }

  return NextResponse.json({ patients: filtered, stats })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, cpf, birthDate, leadSourceId } = body

  if (!name) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
  }

  const patient = await prisma.patient.create({
    data: {
      name,
      phone: phone || null,
      email: email || null,
      cpf: cpf || null,
      birthDate: birthDate ? new Date(birthDate) : null,
      leadSourceId: leadSourceId || null,
      clinicId: CLINIC_ID,
    },
    include: {
      leadSource: { select: { name: true } }
    }
  })

  return NextResponse.json(patient, { status: 201 })
}