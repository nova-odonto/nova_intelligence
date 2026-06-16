// src/app/(app)/dashboard/profile-receptionist.tsx
'use client'

import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, Phone, Plus, Search, AlertCircle } from 'lucide-react'

const mockTodayAgenda = [
  { id: '1', time: '08:00', patient: 'Ana Paula Santos', treatment: 'Implante', status: 'confirmed', phone: '(63) 9 8234-5678' },
  { id: '2', time: '09:30', patient: 'Carlos Eduardo Lima', treatment: 'Clareamento', status: 'confirmed', phone: '(63) 9 9123-4567' },
  { id: '3', time: '11:00', patient: 'Mariana Rodrigues', treatment: 'Ortodontia', status: 'waiting', phone: '(63) 9 8765-4321' },
  { id: '4', time: '14:00', patient: 'João Victor Alves', treatment: 'Prótese Parcial', status: 'confirmed', phone: '(63) 9 9876-5432' },
  { id: '5', time: '15:30', patient: '—', treatment: '—', status: 'available', phone: '' },
  { id: '6', time: '16:00', patient: 'Fernanda Costa', treatment: 'Facetas', status: 'confirmed', phone: '(63) 9 8345-6789' },
]

const mockPendingConfirm = [
  { id: '1', patient: 'Lucas Barbosa', time: 'Amanhã 09:00', phone: '(63) 9 9345-6789' },
  { id: '2', patient: 'Beatriz Oliveira', time: 'Amanhã 14:30', phone: '(63) 9 8456-7890' },
  { id: '3', patient: 'Rodrigo Ferreira', time: 'Quinta 10:00', phone: '(63) 9 9234-5678' },
]

const statusConfig = {
  confirmed: { label: 'Confirmado', variant: 'active' as const },
  waiting: { label: 'Na espera', variant: 'warning' as const },
  available: { label: 'Disponível', variant: 'default' as const },
}

export default function ReceptionistProfilePage({ name }: { name: string }) {
  const firstName = name.split(' ')[0]
  const available = mockTodayAgenda.filter(a => a.status === 'available').length
  const confirmed = mockTodayAgenda.filter(a => a.status === 'confirmed').length

  return (
    <>
      <Topbar title={`Olá, ${firstName}`} subtitle="Central de agendamento" />
      <main className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center gap-3">
          <Button className="flex items-center gap-2"><Plus className="w-4 h-4" />Novo agendamento</Button>
          <Button variant="outline" className="flex items-center gap-2"><Search className="w-4 h-4" />Buscar paciente</Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Confirmados hoje', value: confirmed, color: 'text-green-600' },
            { label: 'Horários livres', value: available, color: 'text-zinc-600' },
            { label: 'Aguardam confirmação', value: mockPendingConfirm.length, color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-[14px] border border-zinc-100 shadow-xs px-5 py-4">
              <p className="text-xs text-zinc-400 mb-1">{s.label}</p>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <section className="bg-white rounded-[14px] border border-zinc-100 shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-50 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-zinc-400" />
            <h2 className="text-sm font-semibold text-zinc-900">Agenda de Hoje</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {mockTodayAgenda.map((appt) => {
              const status = statusConfig[appt.status as keyof typeof statusConfig]
              const isAvailable = appt.status === 'available'
              return (
                <div key={appt.id} className={`flex items-center gap-4 px-5 py-3.5 ${isAvailable ? 'bg-zinc-50/50' : ''}`}>
                  <span className="w-12 text-sm font-semibold text-zinc-900 shrink-0">{appt.time}</span>
                  <div className="w-px h-8 bg-zinc-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {isAvailable ? (
                      <button className="text-sm text-[#730021] font-medium hover:underline flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Agendar horário
                      </button>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-zinc-900">{appt.patient}</p>
                        <p className="text-xs text-zinc-400">{appt.treatment}</p>
                      </>
                    )}
                  </div>
                  {!isAvailable && appt.phone && (
                    <a href={`tel:${appt.phone}`} className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
                      <Phone className="w-3 h-3" />{appt.phone}
                    </a>
                  )}
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-[14px] border border-zinc-100 shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-zinc-900">Aguardando Confirmação</h2>
            </div>
            <span className="text-xs bg-amber-50 text-amber-600 font-medium px-2 py-0.5 rounded-full">{mockPendingConfirm.length} pendentes</span>
          </div>
          <div className="divide-y divide-zinc-50">
            {mockPendingConfirm.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{p.patient}</p>
                  <p className="text-xs text-zinc-400">{p.time}</p>
                </div>
                <a
                  href={`https://wa.me/55${p.phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Confirmar
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}