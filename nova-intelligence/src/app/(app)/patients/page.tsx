import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, relativeTime } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'

const mockPatients = [
  { id: '1', name: 'Ana Paula Santos', phone: '(63) 9 8234-5678', source: 'MedPrev', lastVisit: '2024-03-15', treatment: 'Implante', value: 3500, risk: 'high' },
  { id: '2', name: 'Carlos Eduardo Lima', phone: '(63) 9 9123-4567', source: 'Instagram', lastVisit: '2025-01-20', treatment: 'Clareamento', value: 800, risk: 'low' },
  { id: '3', name: 'Mariana Rodrigues', phone: '(63) 9 8765-4321', source: 'Google', lastVisit: null, treatment: 'Ortodontia', value: 4800, risk: 'critical' },
  { id: '4', name: 'João Victor Alves', phone: '(63) 9 9876-5432', source: 'MedPrev', lastVisit: '2024-12-01', treatment: 'Prótese Parcial', value: 2800, risk: 'medium' },
  { id: '5', name: 'Fernanda Costa', phone: '(63) 9 8345-6789', source: 'Indicação', lastVisit: '2025-02-10', treatment: 'Facetas', value: 7200, risk: 'low' },
  { id: '6', name: 'Rodrigo Ferreira', phone: '(63) 9 9234-5678', source: 'MedPrev', lastVisit: '2024-08-22', treatment: 'Canal', value: 1200, risk: 'high' },
  { id: '7', name: 'Beatriz Oliveira', phone: '(63) 9 8456-7890', source: 'Site', lastVisit: null, treatment: 'Implante', value: 3500, risk: 'critical' },
  { id: '8', name: 'Lucas Barbosa', phone: '(63) 9 9345-6789', source: 'Google', lastVisit: '2025-03-01', treatment: 'Restauração', value: 350, risk: 'low' },
]

const riskConfig = {
  critical: { label: 'Crítico', variant: 'lost' as const },
  high: { label: 'Alto', variant: 'warning' as const },
  medium: { label: 'Médio', variant: 'active' as const },
  low: { label: 'Baixo', variant: 'won' as const },
}

export default function PatientsPage() {
  return (
    <>
      <Topbar title="Pacientes" subtitle="Gestão e recuperação de pacientes" />
      <main className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar paciente..."
                className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="w-3.5 h-3.5" />
              Filtros
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">100 pacientes · 34 recuperáveis</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-medium text-zinc-500 px-5 py-3">Paciente</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-5 py-3">Canal</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-5 py-3">Último Contato</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-5 py-3">Tratamento</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-5 py-3">Valor Est.</th>
                <th className="text-left text-xs font-medium text-zinc-500 px-5 py-3">Risco</th>
              </tr>
            </thead>
            <tbody>
              {mockPatients.map((patient, i) => {
                const risk = riskConfig[patient.risk as keyof typeof riskConfig]
                return (
                  <tr
                    key={patient.id}
                    className="border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{patient.name}</p>
                        <p className="text-xs text-zinc-400">{patient.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={patient.source === 'MedPrev' ? 'active' : 'default'}>
                        {patient.source}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-500">
                      {patient.lastVisit ? relativeTime(patient.lastVisit) : (
                        <span className="text-red-500">Nunca visitou</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-zinc-600">{patient.treatment}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">
                      {formatCurrency(patient.value)}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={risk.variant}>{risk.label}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </>
  )
}
