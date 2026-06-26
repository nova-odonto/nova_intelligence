import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addMinutes } from 'date-fns'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export async function POST(req: NextRequest) {
  const { phone, date, time, type } = await req.json()

  if (!phone || !date || !time) {
    return NextResponse.json({ error: 'phone, date e time obrigatórios' }, { status: 400 })
  }

  // Normaliza telefone — remove 55 do início e não-dígitos
  const phoneClean = phone.replace(/\D/g, '').replace(/^55/, '')

  // Busca paciente pelo telefone ou cria
  let patient = await prisma.patient.findFirst({
    where: { phone: { contains: phoneClean }, clinicId: CLINIC_ID }
  })

  if (!patient) {
    patient = await prisma.patient.create({
      data: {
        name: 'Paciente WhatsApp',
        phone: phoneClean,
        clinicId: CLINIC_ID,
      }
    })
  }

  // Dentista padrão
  const dentist = await prisma.dentist.findFirst({ where: { clinicId: CLINIC_ID } })

  const startAt = new Date(`${date}T${time}:00-03:00`)
  const endAt = addMinutes(startAt, 30)

  // Verifica conflito
  const conflict = await prisma.appointment.findFirst({
    where: {
      dentistId: dentist?.id,
      clinicId: CLINIC_ID,
      status: { in: ['SCHEDULED', 'CONFIRMED'] },
      startAt: { lt: endAt },
      endAt: { gt: startAt }
    }
  })

  if (conflict) {
    return NextResponse.json({ error: 'Horário não disponível' }, { status: 409 })
  }

  const appointment = await prisma.appointment.create({
    data: {
      patientId: patient.id,
      dentistId: dentist?.id,
      clinicId: CLINIC_ID,
      startAt,
      endAt,
      type: type ?? 'consulta',
      createdViaAI: true,
      status: 'SCHEDULED',
      notes: 'Agendado via WhatsApp pela Mari'
    }
  })

  return NextResponse.json({ ok: true, appointmentId: appointment.id }, { status: 201 })
}