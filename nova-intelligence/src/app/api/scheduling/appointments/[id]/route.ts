import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STATUS_NOTIFICATION: Record<string, {
  type: 'PATIENT_ARRIVED' | 'APPOINTMENT_CANCELLED' | 'APPOINTMENT_COMPLETED' | 'NO_SHOW'
  title: (name: string) => string
  body: (name: string, time: string, procedure: string) => string
} | null> = {
  CONFIRMED:  {
    type: 'PATIENT_ARRIVED',
    title: (name) => `${name} chegou`,
    body: (name, time, procedure) => `Paciente aguardando para ${procedure} às ${time}.`,
  },
  COMPLETED:  {
    type: 'APPOINTMENT_COMPLETED',
    title: (name) => `Atendimento concluído`,
    body: (name, time, procedure) => `${procedure} de ${name} foi concluído.`,
  },
  CANCELLED:  {
    type: 'APPOINTMENT_CANCELLED',
    title: (name) => `Agendamento cancelado`,
    body: (name, time, procedure) => `${name} cancelou o agendamento de ${procedure} das ${time}.`,
  },
  NO_SHOW: {
    type: 'NO_SHOW',
    title: (name) => `Paciente não compareceu`,
    body: (name, time, procedure) => `${name} não compareceu para ${procedure} das ${time}.`,
  },
  SCHEDULED: null,
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await req.json()

  const validStatuses = ['SCHEDULED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const appointment = await prisma.appointment.update({
    where: { id },
    data: { status },
    include: {
      patient: { select: { id: true, name: true, phone: true } },
      dentist: { select: { id: true, name: true, specialty: true } },
    }
  })

  // Cria notificação se relevante
  const notifConfig = STATUS_NOTIFICATION[status]
  if (notifConfig) {
    const time = format(new Date(appointment.startAt), 'HH:mm', { locale: ptBR })
    const patientName = appointment.patient?.name ?? 'Paciente'
    const procedure = appointment.type

    await prisma.notification.create({
      data: {
        clinicId: appointment.clinicId,
        type: notifConfig.type,
        title: notifConfig.title(patientName),
        body: notifConfig.body(patientName, time, procedure),
        read: false,
      }
    })
  }

  return NextResponse.json(appointment)
}