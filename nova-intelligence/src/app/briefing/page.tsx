// src/app/briefing/page.tsx
import { ArrowRight, TrendingUp, AlertTriangle, Sparkles, Star, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { formatCurrency } from '@/lib/utils'
import { BriefingTracker } from './briefing-tracker'
import { BriefingKpiCard } from './briefing-kpi-card'

async function getMockBriefing() {
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
      { id: '1', patientName: 'Marcos Oliveira', treatment: 'Prótese Protocolo', value: 12000, lastContact: '15 dias atrás' },
      { id: '2', patientName: 'Ana Santos', treatment: 'Implante Dentário', value: 3500, lastContact: '3 dias atrás' },
      { id: '3', patientName: 'Carlos Lima', treatment: 'Facetas de Porcelana', value: 7200, lastContact: 'Nunca' },
      { id: '4', patientName: 'Juliana Costa', treatment: 'Ortodontia', value: 4800, lastContact: '45 dias atrás' },
      { id: '5', patientName: 'Ricardo Alves', treatment: 'Invisalign', value: 8500, lastContact: '7 dias atrás' },
    ],
  }
}

export default async function BriefingPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== 'OWNER') redirect('/dashboard')

  const data = await getMockBriefing()
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = data.ownerName.split(' ').slice(0, 2).join(' ')

  return (
    <div className="min-h-screen bg-[#F8F7F5]">
      <BriefingTracker />
      <div className="max-w-2xl mx-auto px-6 py-14">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#730021] animate-pulse" />
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest">
              Briefing Executivo · últimos 15 dias
            </span>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', Georgia, serif" }} className="text-4xl text-zinc-900 mb-2">
            {greeting}, {firstName}.
          </h1>
          <p className="text-sm text-zinc-400">Aqui está o panorama financeiro da sua clínica.</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <BriefingKpiCard
            icon={<TrendingUp className="w-3.5 h-3.5 text-green-600" />}
            label="Receita Recuperada"
            value={formatCurrency(data.recoveredRevenue)}
            period="últimos 15 dias"
            valueClass="text-green-600"
            borderClass="border-green-100"
            tooltip="Valor total recuperado de pacientes que estavam inativos ou com tratamentos abandonados e retornaram à clínica nos últimos 15 dias."
          />
          <BriefingKpiCard
            icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
            label="Receita em Risco"
            value={formatCurrency(data.revenueAtRisk)}
            period="últimos 15 dias"
            valueClass="text-amber-500"
            borderClass="border-amber-100"
            tooltip="Soma dos tratamentos orçados ou iniciados que ainda não foram concluídos e cujos pacientes estão sem contato. Esse valor pode ser perdido se não houver ação."
          />
          <BriefingKpiCard
            icon={<Sparkles className="w-3.5 h-3.5 text-[#730021]" />}
            label="Potencial Total"
            value={formatCurrency(data.revenuePotential)}
            period="últimos 15 dias"
            valueClass="text-[#730021]"
            borderClass="border-[#730021]/10"
            tooltip="Receita máxima possível se todas as oportunidades ativas — pacientes recuperáveis, orçamentos abertos e tratamentos pausados — forem convertidas."
          />
        </div>

        <div className="bg-white rounded-[14px] border border-zinc-100 shadow-sm p-5 mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-[#730021]" />
              <span className="text-[10px] font-semibold text-[#730021] uppercase tracking-wide">Canal em Destaque</span>
            </div>
            <p className="text-base font-semibold text-zinc-900">{data.featuredChannel}</p>
            <p className="text-sm text-zinc-400">{formatCurrency(data.featuredChannelValue)} em receita gerada</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#730021]/8 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#730021]" />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">Insights Inteligentes</p>
          <div className="space-y-2.5">
            {data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-[14px] border border-zinc-100 shadow-sm px-4 py-3.5">
                <div className="w-5 h-5 rounded-full bg-[#730021]/8 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] font-bold text-[#730021]">{i + 1}</span>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-4">Maiores Oportunidades Ativas</p>
          <div className="bg-white rounded-[14px] border border-zinc-100 shadow-sm overflow-hidden">
            {data.topOpportunities.map((opp, i) => (
              <div key={opp.id} className={`flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors ${i < data.topOpportunities.length - 1 ? 'border-b border-zinc-50' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-zinc-900">{opp.patientName}</p>
                  <p className="text-xs text-zinc-400">{opp.treatment}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-900">{formatCurrency(opp.value)}</p>
                  <p className="text-[11px] text-zinc-400">Último contato: {opp.lastContact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#730021] hover:bg-[#5c001a] text-white text-sm font-medium px-8 py-3 rounded-xl transition-colors">
            Acessar Plataforma
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-xs text-zinc-400 mt-3">Apenas visível para a conta Owner</p>
        </div>
      </div>
    </div>
  )
}