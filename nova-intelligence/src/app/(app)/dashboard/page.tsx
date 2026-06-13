import { TrendingUp, AlertTriangle, Users, GitBranch } from 'lucide-react'
import { Topbar } from '@/components/layout/topbar'
import { MetricCard } from '@/components/ui/metric-card'
import { RevenueChart } from '@/features/dashboard/revenue-chart'
import { StatusBreakdown } from '@/features/dashboard/status-breakdown'
import { formatCurrency, formatPercent } from '@/lib/utils'

// Mock data — substituir por query real após prisma migrate
const mockMetrics = {
  recoveredRevenue: 28400,
  revenueAtRisk: 67200,
  recoverablePatients: 34,
  conversionRate: 28.4,
  topLeadSource: { name: 'MedPrev', value: 34200, count: 35 },
  monthlyData: [
    { month: 'jan', recovered: 3200, lost: 8400, potential: 12000 },
    { month: 'fev', recovered: 4100, lost: 6200, potential: 15000 },
    { month: 'mar', recovered: 5800, lost: 7100, potential: 18500 },
    { month: 'abr', recovered: 3900, lost: 9200, potential: 14200 },
    { month: 'mai', recovered: 6200, lost: 5800, potential: 21000 },
    { month: 'jun', recovered: 5200, lost: 4900, potential: 19800 },
  ],
  statusBreakdown: [
    { status: 'Ativo', count: 28, value: 67200 },
    { status: 'Ganho', count: 12, value: 31400 },
    { status: 'Recuperado', count: 8, value: 28400 },
    { status: 'Perdido', count: 7, value: 18200 },
  ],
}

export default function DashboardPage() {
  const m = mockMetrics

  return (
    <>
      <Topbar
        title="Visão Geral"
        subtitle="Nova Odontologia · Taquaralto, Palmas"
      />
      <main className="p-6 space-y-6">
        {/* Métricas principais */}
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Receita Recuperada"
            value={formatCurrency(m.recoveredRevenue)}
            subtitle="últimos 12 meses"
            icon={TrendingUp}
            variant="success"
            trend={12.4}
          />
          <MetricCard
            title="Receita em Risco"
            value={formatCurrency(m.revenueAtRisk)}
            subtitle="oportunidades sem follow-up"
            icon={AlertTriangle}
            variant="warning"
          />
          <MetricCard
            title="Pacientes Recuperáveis"
            value={String(m.recoverablePatients)}
            subtitle="sem visita há +90 dias"
            icon={Users}
            variant="danger"
          />
          <MetricCard
            title="Canal em Destaque"
            value={m.topLeadSource.name}
            subtitle={`${formatCurrency(m.topLeadSource.value)} gerados · ${m.topLeadSource.count} pacientes`}
            icon={GitBranch}
            variant="primary"
          />
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2">
            <RevenueChart data={m.monthlyData} />
          </div>
          <div>
            <StatusBreakdown data={m.statusBreakdown} />
          </div>
        </div>
      </main>
    </>
  )
}
