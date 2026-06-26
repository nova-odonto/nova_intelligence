'use client'

import { useState, useEffect } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Topbar } from '@/components/layout/topbar'
import { NewAppointmentModal } from './components/NewAppointmentModal'
import { AppointmentDetailDrawer } from './components/AppointmentDetailDrawer'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { 'pt-BR': ptBR }
})

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

export default function SchedulingPage() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [view, setView] = useState<any>(Views.WEEK)
  const [date, setDate] = useState(new Date())
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null)

  useEffect(() => {
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 5000)
    return () => clearInterval(interval)
  }, [date])

  async function fetchAppointments() {
    const from = format(date, 'yyyy-MM-01')
    const to = format(date, `yyyy-MM-${new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()}`)
    const res = await fetch(`/api/scheduling/appointments?clinicId=${CLINIC_ID}&from=${from}&to=${to}`)
    const data = await res.json()
    setAppointments(
      data.map((a: any) => ({
        id: a.id,
        title: `${a.patient?.name} — ${a.type}`,
        start: new Date(a.startAt),
        end: new Date(a.endAt),
        resource: a
      }))
    )
  }

  function handleSelectSlot(slot: { start: Date; end: Date }) {
    setSelectedSlot(slot)
    setModalOpen(true)
  }

  function handleSelectEvent(event: any) {
    setSelectedAppointment(event)
  }

  return (
    <>
      <Topbar
        title="Agenda"
        subtitle="Visualize e gerencie os agendamentos da clínica"
      />
      <main className="p-6 flex flex-col gap-4 h-[calc(100vh-80px)]">
        <div className="flex justify-end">
          <button
            onClick={() => { setSelectedSlot(null); setModalOpen(true) }}
            className="bg-[#730021] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#8a0027] transition"
          >
            + Novo agendamento
          </button>
        </div>

        <div className="flex-1 bg-white rounded-xl border border-zinc-200 p-4 overflow-hidden">
          <Calendar
            localizer={localizer}
            events={appointments}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            min={new Date(0, 0, 0, 8, 0, 0)}
            max={new Date(0, 0, 0, 18, 0, 0)}
            scrollToTime={new Date(0, 0, 0, 8, 0, 0)}
            style={{ height: '100%' }}
            messages={{
              next: 'Próximo',
              previous: 'Anterior',
              today: 'Hoje',
              month: 'Mês',
              week: 'Semana',
              day: 'Dia',
              agenda: 'Agenda',
              noEventsInRange: 'Nenhum agendamento neste período'
            }}
            culture="pt-BR"
          />
        </div>

        {modalOpen && (
          <NewAppointmentModal
            clinicId={CLINIC_ID}
            initialSlot={selectedSlot}
            onClose={() => setModalOpen(false)}
            onSaved={() => { setModalOpen(false); fetchAppointments() }}
          />
        )}

        {selectedAppointment && (
          <AppointmentDetailDrawer
            appointment={selectedAppointment}
            onClose={() => setSelectedAppointment(null)}
            onStatusChanged={fetchAppointments}
          />
        )}
      </main>
    </>
  )
}