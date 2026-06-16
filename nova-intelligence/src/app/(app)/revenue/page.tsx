// src/app/(app)/revenue/page.tsx
'use client'

import { useState, useRef } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { TrendingUp, DollarSign, TrendingDown, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface KpiCardProps {
  title: string
  value: string
  tooltip: string
  icon: React.ElementType
  trend: number
  variant?: 'default' | 'success' | 'danger' | 'primary'
}

const variantStyles = {
  default: { border: 'border-zinc-100', bg: 'bg-white', valueColor: 'text-zinc-900', iconBg: 'bg-zinc-50', iconColor: 'text-zinc-400', trendPos: 'text-green-600', trendNeg: 'text-red-500' },
  success: { border: 'border-green-100', bg: 'bg-white', valueColor: 'text-green-600', iconBg: 'bg-green-50', iconColor: 'text-green-600', trendPos: 'text-green-600', trendNeg: 'text-red-500' },
  danger: { border: 'border-red-100', bg: 'bg-white', valueColor: 'text-[#730021]', iconBg: 'bg-[#730021]/8', iconColor: 'text-[#730021]', trendPos: 'text-green-600', trendNeg: 'text-[#730021]' },
  primary: { border: 'border-[#730021]', bg: 'bg-[#730021]', valueColor: 'text-white', iconBg: 'bg-white/15', iconColor: 'text-white', trendPos: 'text-white/80', trendNeg: 'text-white/60' },
}

function KpiCard({ title, value, tooltip, icon: Icon, trend, variant = 'default' }: KpiCardProps) {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [visible, setVisible] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const s = variantStyles[variant]
  const isPrimary = variant === 'primary'

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setPos({ x: e.clientX - rect.left + 16, y: e.clientY - rect.top + 16 })
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={`relative rounded-[14px] border shadow-sm p-4 md:p-5 cursor-default select-none overflow-visible flex flex-col gap-2 md:gap-3 ${s.bg} ${s.border}`}
    >
      <div className="flex items-start justify-between">
        <p className={`text-[10px] font-semibold uppercase tracking-widest leading-tight ${isPrimary ? 'text-white/60' : 'text-zinc-400'}`}>
          {title}
        </p>
        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}>
          <Icon className={`w-3 h-3 md:w-3.5 md:h-3.5 ${s.iconColor}`} />
        </div>
      </div>
      <p style={{ fontFamily: "'Instrument Serif', Georgia, serif" }} className={`text-2xl md:text-[34px] leading-none ${s.valueColor}`}>
        {value}
      </p>
      <p className={`text-xs font-medium ${trend >= 0 ? s.trendPos : s.trendNeg}`}>
        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs mês anterior
      </p>

      {visible && (
        <div
          className="pointer-events-none absolute z-50 bg-white border border-zinc-100 shadow-lg rounded-xl px-4 py-3 hidden md:block"
          style={{ left: pos.x, top: pos.y, width: '240px' }}
        >
          <p className="text-[10px] font-semibold text-[#730021] uppercase tracking-wider mb-1">{title}</p>
          <p className="text-xs text-zinc-500 leading-relaxed">{tooltip}</p>
        </div>
      )}
    </div>
  )
}

const kpis = [
  { title: 'Total Recuperado', value: formatCurrency(28400), variant: 'success' as const, icon: TrendingUp, trend: 12.4, tooltip: 'Valor total gerado por pacientes que estavam inativos ou com tratamentos abandonados e retornaram à clínica neste período.' },
  { title: 'Total Ganho', value: formatCurrency(31400), variant: 'default' as const, icon: DollarSign, trend: 8.2, tooltip: 'Receita total confirmada no período, incluindo todos os tratamentos concluídos e pagamentos recebidos.' },
  { title: 'Total Perdido', value: formatCurrency(18200), variant: 'danger' as const, icon: TrendingDown, trend: -4.1, tooltip: 'Valor estimado de oportunidades perdidas: pacientes que não retornaram, orçamentos recusados e tratamentos cancelados.' },
  { title: 'Ticket Médio', value: formatCurrency(3280), variant: 'primary' as const, icon: Target, trend: 6.7, tooltip: 'Valor médio por atendimento ou tratamento concluído no período.' },
]

const treatments = [
  { name: 'Prótese Protocolo', value: 36000, count: 3 },
  { name: 'Facetas de Porcelana', value: 28800, count: 4 },
  { name: 'Invisalign', value: 25500, count: 3 },
  { name: 'Ortodontia', value: 24000, count: 5 },
  { name: 'Implante Dentário', value: 17500, count: 5 },
]

export default function RevenuePage() {
  return (
    <>
      <Topbar title="Receita" subtitle="Análise financeira detalhada" />
      <main className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {kpis.map((k) => <KpiCard key={k.title} {...k} />)}
        </div>

        <div className="bg-white rounded-[14px] border border-zinc-100 shadow-sm p-4 md:p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">Receita por Tratamento</h2>
          <p className="text-xs text-zinc-400 mb-4 md:mb-5">Top tratamentos por valor total gerado</p>
          <div className="space-y-4">
            {treatments.map((item) => {
              const pct = (item.value / treatments[0].value) * 100
              return (
                <div key={item.name}>
                  <div className="flex items-start md:items-center justify-between mb-1.5 gap-2">
                    <span className="text-sm text-zinc-700 shrink-0">{item.name}</span>
                    <div className="flex items-center gap-2 md:gap-3 shrink-0">
                      <span className="text-xs text-zinc-400 hidden md:block">{item.count} procedimentos</span>
                      <span className="text-sm font-semibold text-zinc-900">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-[#730021]/70" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </>
  )
}