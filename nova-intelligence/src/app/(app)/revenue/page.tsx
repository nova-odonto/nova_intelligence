import { Topbar } from '@/components/layout/topbar'
import { MetricCard } from '@/components/ui/metric-card'
import { TrendingUp, DollarSign, TrendingDown, Target } from 'lucide-react'
import { formatCurrency, formatPercent } from '@/lib/utils'

export default function RevenuePage() {
  return (
    <>
      <Topbar title="Receita" subtitle="Análise financeira detalhada" />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <MetricCard title="Total Recuperado" value={formatCurrency(28400)} variant="success" icon={TrendingUp} trend={12.4} />
          <MetricCard title="Total Ganho" value={formatCurrency(31400)} variant="default" icon={DollarSign} trend={8.2} />
          <MetricCard title="Total Perdido" value={formatCurrency(18200)} variant="danger" icon={TrendingDown} trend={-4.1} />
          <MetricCard title="Ticket Médio" value={formatCurrency(3280)} variant="primary" icon={Target} trend={6.7} />
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 p-6">
          <h2 className="text-sm font-semibold text-zinc-900 mb-1">Receita por Tratamento</h2>
          <p className="text-xs text-zinc-400 mb-5">Top tratamentos por valor total gerado</p>
          <div className="space-y-3">
            {[
              { name: 'Prótese Protocolo', value: 36000, count: 3 },
              { name: 'Facetas de Porcelana', value: 28800, count: 4 },
              { name: 'Invisalign', value: 25500, count: 3 },
              { name: 'Ortodontia', value: 24000, count: 5 },
              { name: 'Implante Dentário', value: 17500, count: 5 },
            ].map((item, i) => {
              const max = 36000
              const pct = (item.value / max) * 100
              return (
                <div key={item.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-zinc-700">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-zinc-400">{item.count} procedimentos</span>
                      <span className="text-sm font-semibold text-zinc-900">{formatCurrency(item.value)}</span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400"
                      style={{ width: `${pct}%` }}
                    />
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
