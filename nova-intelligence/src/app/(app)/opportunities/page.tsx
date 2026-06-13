import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

const columns = [
  {
    id: 'ACTIVE',
    label: 'Ativo',
    color: 'bg-blue-500',
    variant: 'active' as const,
    items: [
      { id: '1', patient: 'Marcos Oliveira', treatment: 'Prótese Protocolo', value: 12000, source: 'MedPrev', days: 15 },
      { id: '2', patient: 'Ana Souza', treatment: 'Implante', value: 3500, source: 'Instagram', days: 3 },
      { id: '3', patient: 'Carlos Lima', treatment: 'Facetas', value: 7200, source: 'Google', days: 92 },
    ],
  },
  {
    id: 'WON',
    label: 'Ganho',
    color: 'bg-emerald-500',
    variant: 'won' as const,
    items: [
      { id: '4', patient: 'Fernanda Costa', treatment: 'Ortodontia', value: 4800, source: 'Indicação', days: 0 },
      { id: '5', patient: 'Paulo Mendes', treatment: 'Canal', value: 1200, source: 'MedPrev', days: 0 },
    ],
  },
  {
    id: 'RECOVERED',
    label: 'Recuperado',
    color: 'bg-indigo-500',
    variant: 'recovered' as const,
    items: [
      { id: '6', patient: 'Beatriz Santos', treatment: 'Clareamento', value: 800, source: 'Site', days: 0 },
      { id: '7', patient: 'Lucas Ferreira', treatment: 'Restauração', value: 350, source: 'MedPrev', days: 0 },
    ],
  },
  {
    id: 'LOST',
    label: 'Perdido',
    color: 'bg-red-500',
    variant: 'lost' as const,
    items: [
      { id: '8', patient: 'Diego Alves', treatment: 'Implante', value: 3500, source: 'Google', days: 0 },
    ],
  },
]

export default function OpportunitiesPage() {
  return (
    <>
      <Topbar title="Oportunidades" subtitle="Pipeline de tratamentos e recuperação" />
      <main className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {columns.map((col) => {
            const total = col.items.reduce((s, i) => s + i.value, 0)
            return (
              <div key={col.id}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.color}`} />
                    <span className="text-sm font-medium text-zinc-700">{col.label}</span>
                    <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-1.5">
                      {col.items.length}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-zinc-500">{formatCurrency(total)}</span>
                </div>

                <div className="space-y-2">
                  {col.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-zinc-100 rounded-xl p-4 cursor-pointer hover:border-zinc-200 hover:shadow-sm transition-all"
                    >
                      <p className="text-sm font-medium text-zinc-900 mb-0.5">{item.patient}</p>
                      <p className="text-xs text-zinc-500 mb-3">{item.treatment}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={col.id === 'ACTIVE' && item.days > 60 ? 'lost' : 'default'}>
                          {item.source}
                        </Badge>
                        <span className="text-sm font-semibold text-zinc-800">
                          {formatCurrency(item.value)}
                        </span>
                      </div>
                      {col.id === 'ACTIVE' && item.days > 30 && (
                        <div className="mt-2 pt-2 border-t border-zinc-50">
                          <p className="text-[11px] text-amber-600">
                            {item.days}d sem contato
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
