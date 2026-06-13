import { ArrowRight, TrendingUp, AlertTriangle, Sparkles, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { getBriefingData } from '@/services/briefing.service'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

// Mock clinic ID — será substituído por sessão real
const CLINIC_ID = 'demo'

async function getMockBriefing() {
  // Dados mockados para preview sem banco
  return {
    ownerName: 'Dra. Tamires Freire',
    recoveredRevenue: 28400,
    revenueAtRisk: 67200,
    revenuePotential: 142500,
    featuredChannel: 'MedPrev',
    featuredChannelValue: 34200,
    insights: [
      '12 oportunidades ativas sem contato há mais de 90 dias.',
      'MedPrev é o canal com maior receita gerada — priorize esse canal.',
      'Taxa de conversão atual: 28.4%. Meta recomendada: 35%.',
      '7 oportunidades perdidas nos últimos 12 meses — revise o processo de follow-up.',
    ],
    topOpportunities: [
      { id: '1', patientName: 'Marcos Oliveira', treatment: 'Prótese Protocolo', value: 12000, status: 'ACTIVE' as const, lastContact: '15 dias atrás' },
      { id: '2', patientName: 'Ana Santos', treatment: 'Implante Dentário', value: 3500, status: 'ACTIVE' as const, lastContact: '3 dias atrás' },
      { id: '3', patientName: 'Carlos Lima', treatment: 'Facetas de Porcelana', value: 7200, status: 'ACTIVE' as const, lastContact: 'Nunca' },
      { id: '4', patientName: 'Juliana Costa', treatment: 'Ortodontia', value: 4800, status: 'ACTIVE' as const, lastContact: '45 dias atrás' },
      { id: '5', patientName: 'Ricardo Alves', treatment: 'Invisalign', value: 8500, status: 'ACTIVE' as const, lastContact: '7 dias atrás' },
    ],
  }
}

export default async function BriefingPage() {
  const data = await getMockBriefing()

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(99,102,241,0.15)_0%,_transparent_60%)] pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(16,185,129,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
              Briefing Executivo
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white mb-1">
            {greeting()}, {data.ownerName.split(' ').slice(0, 2).join(' ')}.
          </h1>
          <p className="text-zinc-400">
            Aqui está o panorama financeiro da sua clínica.
          </p>
        </div>

        {/* Métricas principais */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Receita Recuperada</span>
            </div>
            <p className="text-2xl font-bold text-emerald-400">
              {formatCurrency(data.recoveredRevenue)}
            </p>
            <p className="text-xs text-zinc-600 mt-1">últimos 12 meses</p>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-amber-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Receita em Risco</span>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {formatCurrency(data.revenueAtRisk)}
            </p>
            <p className="text-xs text-zinc-600 mt-1">oportunidades ativas</p>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-indigo-900/40 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wide">Potencial Total</span>
            </div>
            <p className="text-2xl font-bold text-indigo-400">
              {formatCurrency(data.revenuePotential)}
            </p>
            <p className="text-xs text-zinc-600 mt-1">todas as oportunidades</p>
          </div>
        </div>

        {/* Canal em destaque */}
        <div className="rounded-xl bg-indigo-600/10 border border-indigo-600/20 p-5 mb-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-indigo-400" />
              <span className="text-xs text-indigo-400 font-medium uppercase tracking-wide">
                Canal em Destaque
              </span>
            </div>
            <p className="text-lg font-semibold text-white">{data.featuredChannel}</p>
            <p className="text-sm text-zinc-400">
              {formatCurrency(data.featuredChannelValue)} em receita gerada
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Insights */}
        <div className="mb-10">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Insights Inteligentes
          </h2>
          <div className="space-y-3">
            {data.insights.map((insight, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900 border border-zinc-800"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-600/40 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-indigo-400">{i + 1}</span>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top oportunidades */}
        <div className="mb-12">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-4">
            Maiores Oportunidades Ativas
          </h2>
          <div className="rounded-xl border border-zinc-800 overflow-hidden">
            {data.topOpportunities.map((opp, i) => (
              <div
                key={opp.id}
                className={`flex items-center justify-between px-5 py-4 ${
                  i < data.topOpportunities.length - 1 ? 'border-b border-zinc-800' : ''
                } hover:bg-zinc-900/50 transition-colors`}
              >
                <div>
                  <p className="text-sm font-medium text-white">{opp.patientName}</p>
                  <p className="text-xs text-zinc-500">{opp.treatment}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">{formatCurrency(opp.value)}</p>
                  <p className="text-xs text-zinc-600">
                    Último contato: {opp.lastContact ?? 'Nunca'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-medium gap-2 h-auto"
            >
              Acessar Plataforma
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <p className="text-xs text-zinc-600 mt-3">Apenas visível para a conta Owner</p>
        </div>
      </div>
    </div>
  )
}
