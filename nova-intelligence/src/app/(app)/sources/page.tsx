import { Topbar } from '@/components/layout/topbar'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const sources = [
  { name: 'MedPrev', patients: 35, opportunities: 18, revenue: 34200, conversion: 38.9, growth: 12.4 },
  { name: 'Instagram', patients: 15, opportunities: 9, revenue: 18400, conversion: 33.3, growth: 28.1 },
  { name: 'Google', patients: 20, opportunities: 12, revenue: 22100, conversion: 41.7, growth: 5.2 },
  { name: 'Indicação', patients: 18, opportunities: 8, revenue: 28900, conversion: 50.0, growth: 18.7 },
  { name: 'Site', patients: 12, opportunities: 3, revenue: 8200, conversion: 25.0, growth: -3.1 },
]

const total = sources.reduce((s, x) => s + x.revenue, 0)

export default function SourcesPage() {
  return (
    <>
      <Topbar title="Canais de Aquisição" subtitle="Performance por origem de paciente" />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-5 gap-4">
          {sources.map((source) => {
            const share = (source.revenue / total) * 100
            return (
              <div key={source.name} className="bg-white rounded-xl border border-zinc-100 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{source.name}</p>
                    <p className="text-xs text-zinc-400">{source.patients} pacientes</p>
                  </div>
                  <Badge variant={source.growth >= 0 ? 'won' : 'lost'}>
                    {source.growth >= 0 ? '+' : ''}{source.growth}%
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Receita gerada</p>
                    <p className="text-lg font-bold text-zinc-900">{formatCurrency(source.revenue)}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Participação</span>
                      <span>{share.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Conversão</span>
                    <span className="font-medium text-zinc-700">{formatPercent(source.conversion)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Table view */}
        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Detalhamento por Canal</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                {['Canal', 'Pacientes', 'Oportunidades', 'Receita Total', 'Tx. Conversão', 'Crescimento'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-zinc-500 px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr key={s.name} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-900">{s.name}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600">{s.patients}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600">{s.opportunities}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">{formatCurrency(s.revenue)}</td>
                  <td className="px-5 py-3.5 text-sm text-zinc-600">{formatPercent(s.conversion)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-medium ${s.growth >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {s.growth >= 0 ? '+' : ''}{s.growth}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
