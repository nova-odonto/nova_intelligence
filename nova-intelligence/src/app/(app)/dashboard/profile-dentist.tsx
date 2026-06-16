// src/app/(app)/dashboard/profile-dentist.tsx
'use client'

import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, User } from 'lucide-react'

const mockTodayAppointments = [
  { id: '1', time: '08:00', patient: 'Ana Paula Santos', treatment: 'Implante Dentário', duration: 60, status: 'confirmed' },
  { id: '2', time: '09:30', patient: 'Carlos Eduardo Lima', treatment: 'Clareamento Dental', duration: 45, status: 'confirmed' },
  { id: '3', time: '11:00', patient: 'Mariana Rodrigues', treatment: 'Ortodontia - Ajuste', duration: 30, status: 'waiting' },
  { id: '4', time: '14:00', patient: 'João Victor Alves', treatment: 'Prótese Parcial', duration: 90, status: 'confirmed' },
  { id: '5', time: '16:00', patient: 'Fernanda Costa', treatment: 'Facetas - Avaliação', duration: 30, status: 'confirmed' },
]

const mockMyPatients = [
  { id: '1', name: 'Ana Paula Santos', treatment: 'Implante Dentário', lastVisit: '15/03/2025', nextStep: 'Instalação do pilar' },
  { id: '2', name: 'Mariana Rodrigues', treatment: 'Ortodontia', lastVisit: '02/04/2025', nextStep: 'Troca de bráquetes sup.' },
  { id: '3', name: 'Rodrigo Ferreira', treatment: 'Canal Radicular', lastVisit: '28/02/2025', nextStep: 'Retorno para coroa' },
  { id: '4', name: 'Beatriz Oliveira', treatment: 'Implante Dentário', lastVisit: null, nextStep: 'Primeira consulta pendente' },
]

const statusConfig = {
  confirmed: { label: 'Confirmado', variant: 'active' as const },
  waiting: { label: 'Aguardando', variant: 'warning' as const },
  done: { label: 'Concluído', variant: 'recovered' as const },
}

export default function DentistProfilePage({ name }: { name: string }) {
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      <Topbar title={`Olá, ${name}`} subtitle={today.charAt(0).toUpperCase() + today.slice(1)} />
      <main className="p-6 space-y-6 max-w-4xl">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Consultas hoje', value: mockTodayAppointments.length, icon: CalendarDays },
            { label: 'Horas em atend.', value: '4h 15min', icon: Clock },
            { label: 'Meus pacientes', value: mockMyPatients.length, icon: User },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-[14px] border border-zinc-100 shadow-xs px-5 py-4">
                <div className="flex items-center gap-2 text-zinc-400 mb-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-xs">{stat.label}</span>
                </div>
                <p className="text-2xl font-semibold text-zinc-900">{stat.value}</p>
              </div>
            )
          })}
        </div>

        <section className="bg-white rounded-[14px] border border-zinc-100 shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-50">
            <h2 className="text-sm font-semibold text-zinc-900">Agenda de Hoje</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {mockTodayAppointments.map((appt) => {
              const status = statusConfig[appt.status as keyof typeof statusConfig]
              return (
                <div key={appt.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-14 shrink-0 text-center">
                    <span className="text-sm font-semibold text-zinc-900">{appt.time}</span>
                    <p className="text-[10px] text-zinc-400">{appt.duration}min</p>
                  </div>
                  <div className="w-px h-8 bg-zinc-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900">{appt.patient}</p>
                    <p className="text-xs text-zinc-400">{appt.treatment}</p>
                  </div>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
              )
            })}
          </div>
        </section>

        <section className="bg-white rounded-[14px] border border-zinc-100 shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-50">
            <h2 className="text-sm font-semibold text-zinc-900">Meus Pacientes em Tratamento</h2>
          </div>
          <div className="divide-y divide-zinc-50">
            {mockMyPatients.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-8 h-8 rounded-full bg-[#730021]/10 flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-[#730021]">
                    {p.name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{p.name}</p>
                  <p className="text-xs text-zinc-400">{p.treatment}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-zinc-500">{p.nextStep}</p>
                  {p.lastVisit && <p className="text-[10px] text-zinc-300">Último: {p.lastVisit}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}