// src/app/(app)/dashboard/profile-manager.tsx
'use client'

import { Topbar } from '@/components/layout/topbar'
import { MetricCard } from '@/components/ui/metric-card'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const mockAlerts = [
  { id: 1, type: 'risk', message: '14 pacientes sem retorno há mais de 6 meses', action: '/patients' },
  { id: 2, type: 'opportunity', message: 'R$ 38.400 em implantes com orçamento aberto', action: '/opportunities' },
  { id: 3, type: 'win', message: '3 pacientes recuperados esta semana via WhatsApp', action: '/patients' },
]

export default function ManagerProfilePage({ name }: { name: string }) {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = name.split(' ')[0]

  return (
    <>
      <Topbar title={`${greeting}, ${firstName}`} subtitle="Visão geral da clínica" />
      <main className="p-6 space-y-6 max-w-5xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Receita Recuperada" value={formatCurrency(47200)} subtitle="+12% vs mês anterior" variant="success" icon={TrendingUp} />
          <MetricCard title="Receita em Risco" value={formatCurrency(89600)} subtitle="14 pacientes inativos" variant="danger" icon={AlertTriangle} />
          <MetricCard title="Pacientes Recuperáveis" value="23" subtitle="Potencial R$ 38.400" variant="warning" icon={Users} />
          <MetricCard title="Taxa de Comparecimento" value="78%" subtitle="+3pp este mês" variant="primary" icon={CheckCircle} />
        </div>

        <section className="bg-white rounded-[14px] border border-zinc-100 shadow-xs">
          <div className="px-5 py-4 border-b border-zinc-50 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900">Radar de Perdas</h2>
            <span className="text-xs bg-red-50 text-red-600 font-medium px-2 py-0.5 rounded-full">Atenção necessária</span>
          </div>
          <div className="divide-y divide-zinc-50">
            {mockAlerts.map((alert) => (
              <Link key={alert.id} href={alert.action} className="flex items-center justify-between px-5 py-3.5 hover:bg-zinc-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${alert.type === 'risk' ? 'bg-red-500' : alert.type === 'opportunity' ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <span className="text-sm text-zinc-700">{alert.message}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  )
}