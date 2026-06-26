'use client'

import { useState, useEffect, useMemo } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { formatCurrency } from '@/lib/utils'
import {
  MessageSquare, Zap, Users, CheckCircle2,
  Loader2, AlertTriangle, ChevronLeft, ExternalLink,
  Filter, Clock
} from 'lucide-react'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

const TEMPLATES = [
  {
    id: 'retorno',
    label: 'Retorno de tratamento',
    text: `Olá, {nome}! 😊 Tudo bem?\n\nNotamos que faz um tempo que você não vem à Nova Odontologia. Seu tratamento ainda está em andamento? Podemos verificar um horário especial para você esta semana.\n\nResponda aqui e nossa equipe te atende agora mesmo!`,
  },
  {
    id: 'orcamento',
    label: 'Orçamento em aberto',
    text: `Oi, {nome}! Tudo bem?\n\nVimos que você tem um orçamento em aberto conosco e gostaríamos de saber se ainda tem interesse. Temos condições especiais esta semana! 🦷\n\nResponda aqui para saber mais.`,
  },
  {
    id: 'prevencao',
    label: 'Limpeza e prevenção',
    text: `Olá, {nome}! 😊\n\nJá faz um tempo desde sua última visita à Nova Odontologia. Que tal agendar sua limpeza e check-up? Manter a saúde bucal em dia evita tratamentos mais complexos no futuro!\n\nResponda aqui e encontramos o melhor horário para você.`,
  },
  {
    id: 'personalizado',
    label: 'Mensagem personalizada',
    text: '',
  },
]

const DAYS_FILTERS = [
  { value: 0,   label: 'Todos' },
  { value: 30,  label: '+30 dias' },
  { value: 60,  label: '+60 dias' },
  { value: 90,  label: '+90 dias' },
]

export default function CampaignPage() {
  const [step, setStep] = useState<'select' | 'compose' | 'sending' | 'done'>('select')
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [templateId, setTemplateId] = useState('retorno')
  const [message, setMessage] = useState(TEMPLATES[0].text)
  const [mode, setMode] = useState<'mari' | 'manual'>('mari')
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [manualLinks, setManualLinks] = useState<string[]>([])

  // Filtros
  const [filterTreatment, setFilterTreatment] = useState('')
  const [filterDays, setFilterDays] = useState(0)

  useEffect(() => { fetchOpportunities() }, [])

  async function fetchOpportunities() {
    setLoading(true)
    try {
      const res = await fetch(`/api/opportunities?clinicId=${CLINIC_ID}&status=ACTIVE`)
      const data = await res.json()
      const withPhone = (Array.isArray(data) ? data : []).filter((o: any) => o.patient?.phone)
      setOpportunities(withPhone)
    } finally {
      setLoading(false)
    }
  }

  // Tratamentos únicos para o dropdown
  const treatments = useMemo(() => {
    const names = opportunities.map(o => o.treatmentName).filter(Boolean)
    return Array.from(new Set(names)).sort()
  }, [opportunities])

  // Oportunidades filtradas
  const filtered = useMemo(() => {
    return opportunities.filter(o => {
      if (filterTreatment && o.treatmentName !== filterTreatment) return false
      if (filterDays > 0) {
        const days = o.lastContactAt
          ? Math.floor((Date.now() - new Date(o.lastContactAt).getTime()) / 86400000)
          : 999
        if (days < filterDays) return false
      }
      return true
    })
  }, [opportunities, filterTreatment, filterDays])

  function getDays(opp: any) {
    if (!opp.lastContactAt) return null
    return Math.floor((Date.now() - new Date(opp.lastContactAt).getTime()) / 86400000)
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else if (next.size < 50) next.add(id)
      return next
    })
  }

  function selectAllFiltered() {
    const ids = filtered.slice(0, 50).map((o: any) => o.id)
    setSelected(new Set(ids))
  }

  function handleTemplateChange(id: string) {
    setTemplateId(id)
    const t = TEMPLATES.find(t => t.id === id)
    if (t && t.id !== 'personalizado') setMessage(t.text)
    else if (t?.id === 'personalizado') setMessage('')
  }

  async function handleSend() {
    if (mode === 'manual') {
      const selectedOpps = opportunities.filter(o => selected.has(o.id))
      const links = selectedOpps.map(o => {
        const phone = o.patient.phone.replace(/\D/g, '')
        const number = phone.startsWith('55') ? phone : `55${phone}`
        const firstName = o.patient.name.split(' ')[0]
        const STOP_MSG = `\n\n_Caso não queira mais receber mensagens da nossa clínica, responda com a palavra *PARE* e seu número será removido automaticamente da nossa lista._`
        const text = encodeURIComponent(message.replace(/\{nome\}/gi, firstName) + STOP_MSG)
        return `https://wa.me/${number}?text=${text}`
      })
      setManualLinks(links)
      setStep('done')
      setResults({ total: links.length, sent: links.length, skipped: 0, manual: true })
      return
    }

    setSending(true)
    setStep('sending')
    try {
      const res = await fetch('/api/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ opportunityIds: Array.from(selected), message, mode })
      })
      const data = await res.json()
      setResults(data)
      setStep('done')
    } finally {
      setSending(false)
    }
  }

  const batches = Math.ceil(selected.size / 15)
  const estimatedMinutes = (batches - 1) * 2 + Math.ceil(selected.size * 3 / 60)

  return (
    <>
      <Topbar title="Campanha de Recuperação" subtitle="Disparo em lote para pacientes inativos" />
      <main className="p-6 max-w-4xl mx-auto space-y-6">

        {/* Step: Selecionar pacientes */}
        {step === 'select' && (
          <>
            {/* Filtros */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2">
                <Filter size={13} className="text-zinc-400" />
                <select
                  value={filterTreatment}
                  onChange={e => { setFilterTreatment(e.target.value); setSelected(new Set()) }}
                  className="text-sm text-zinc-600 bg-transparent focus:outline-none pr-2"
                >
                  <option value="">Todos os procedimentos</option>
                  {treatments.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg px-3 py-2">
                <Clock size={13} className="text-zinc-400" />
                <select
                  value={filterDays}
                  onChange={e => { setFilterDays(Number(e.target.value)); setSelected(new Set()) }}
                  className="text-sm text-zinc-600 bg-transparent focus:outline-none pr-2"
                >
                  {DAYS_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label} sem contato</option>)}
                </select>
              </div>

              {(filterTreatment || filterDays > 0) && (
                <button
                  onClick={() => { setFilterTreatment(''); setFilterDays(0); setSelected(new Set()) }}
                  className="text-xs text-zinc-400 hover:text-zinc-600 transition"
                >
                  Limpar filtros
                </button>
              )}

              <div className="flex-1" />

              <p className="text-sm text-zinc-400">
                {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
                {(filterTreatment || filterDays > 0) && ` · ${selected.size} selecionados`}
              </p>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                {selected.size} selecionados
                {selected.size === 50 && <span className="text-amber-500 ml-2">· limite atingido</span>}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAllFiltered}
                  className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                >
                  Selecionar todos ({Math.min(filtered.length, 50)})
                </button>
                <button
                  onClick={() => setSelected(new Set())}
                  className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                >
                  Limpar
                </button>
                <button
                  onClick={() => setStep('compose')}
                  disabled={selected.size === 0}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-40"
                >
                  Continuar →
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-zinc-100 p-12 text-center">
                <Users className="w-8 h-8 text-zinc-200 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">Nenhum paciente encontrado com esses filtros</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-100">
                      <th className="w-10 px-4 py-3" />
                      <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Paciente</th>
                      <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Tratamento</th>
                      <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Valor</th>
                      <th className="text-left text-xs font-medium text-zinc-400 px-4 py-3">Sem contato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(opp => {
                      const isSelected = selected.has(opp.id)
                      const days = getDays(opp)
                      return (
                        <tr
                          key={opp.id}
                          onClick={() => toggleSelect(opp.id)}
                          className={`border-b border-zinc-50 cursor-pointer transition-colors ${isSelected ? 'bg-[#730021]/3' : 'hover:bg-zinc-50'}`}
                        >
                          <td className="px-4 py-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition ${isSelected ? 'bg-[#730021] border-[#730021]' : 'border-zinc-300'}`}>
                              {isSelected && <CheckCircle2 size={10} className="text-white" />}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-zinc-900">{opp.patient.name}</p>
                            <p className="text-xs text-zinc-400">{opp.patient.phone}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-zinc-600">{opp.treatmentName}</td>
                          <td className="px-4 py-3 text-sm font-medium text-zinc-800">{formatCurrency(opp.estimatedValue)}</td>
                          <td className="px-4 py-3">
                            {days !== null ? (
                              <span className={`text-xs ${days > 60 ? 'text-red-500' : days > 30 ? 'text-amber-500' : 'text-zinc-400'}`}>
                                {days}d
                              </span>
                            ) : <span className="text-xs text-zinc-300">—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* Step: Compor mensagem */}
        {step === 'compose' && (
          <div className="space-y-5">
            <button onClick={() => setStep('select')} className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-600 transition">
              <ChevronLeft size={14} /> Voltar
            </button>

            <div className="bg-white rounded-xl border border-zinc-100 p-5 space-y-3">
              <p className="text-sm font-semibold text-zinc-900">Modo de envio</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('mari')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${mode === 'mari' ? 'border-[#730021] bg-[#730021]/3' : 'border-zinc-100 hover:border-zinc-200'}`}
                >
                  <Zap size={18} className={mode === 'mari' ? 'text-[#730021]' : 'text-zinc-300'} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Via Mari</p>
                    <p className="text-xs text-zinc-400">Automático pela Evolution API</p>
                  </div>
                </button>
                <button
                  onClick={() => setMode('manual')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition text-left ${mode === 'manual' ? 'border-[#730021] bg-[#730021]/3' : 'border-zinc-100 hover:border-zinc-200'}`}
                >
                  <MessageSquare size={18} className={mode === 'manual' ? 'text-[#730021]' : 'text-zinc-300'} />
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Manual</p>
                    <p className="text-xs text-zinc-400">Links wa.me pré-preenchidos</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-100 p-5 space-y-3">
              <p className="text-sm font-semibold text-zinc-900">Template</p>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => handleTemplateChange(t.id)}
                    className={`px-3 py-2 rounded-lg text-xs text-left transition border ${templateId === t.id ? 'border-[#730021] bg-[#730021]/3 text-[#730021] font-medium' : 'border-zinc-100 text-zinc-600 hover:bg-zinc-50'}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-zinc-400">Use <code className="bg-zinc-100 px-1 rounded">{'{nome}'}</code> para personalizar com o primeiro nome</p>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#730021]/20 resize-none"
                />
              </div>
              <div className="bg-zinc-50 rounded-lg px-3 py-2.5">
                <p className="text-[11px] text-zinc-400 font-medium mb-1">Preview do rodapé automático:</p>
                <p className="text-[11px] text-zinc-400 italic">Caso não queira mais receber mensagens da nossa clínica, responda com a palavra PARE e seu número será removido automaticamente da nossa lista.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-100 p-5 space-y-2">
              <p className="text-sm font-semibold text-zinc-900">Resumo da campanha</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 rounded-lg px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-zinc-900">{selected.size}</p>
                  <p className="text-[11px] text-zinc-400">Contatos</p>
                </div>
                <div className="bg-zinc-50 rounded-lg px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-zinc-900">{batches}</p>
                  <p className="text-[11px] text-zinc-400">Lotes de 15</p>
                </div>
                <div className="bg-zinc-50 rounded-lg px-3 py-2.5 text-center">
                  <p className="text-lg font-semibold text-zinc-900">~{estimatedMinutes}min</p>
                  <p className="text-[11px] text-zinc-400">Tempo estimado</p>
                </div>
              </div>
              {mode === 'mari' && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                  <AlertTriangle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">A cada 15 mensagens o sistema aguarda 2 minutos para evitar restrições no WhatsApp.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-40"
              >
                {mode === 'mari' ? <Zap size={14} /> : <MessageSquare size={14} />}
                {mode === 'mari' ? 'Disparar campanha' : 'Gerar links'}
              </button>
            </div>
          </div>
        )}

        {/* Step: Enviando */}
        {step === 'sending' && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-[#730021]" />
            <p className="text-sm font-medium text-zinc-900">Enviando campanha...</p>
            <p className="text-xs text-zinc-400 text-center max-w-xs">
              Disparando em lotes de 15 com intervalo de 2 minutos. Não feche esta aba.
            </p>
          </div>
        )}

        {/* Step: Resultado */}
        {step === 'done' && results && (
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-zinc-100 p-6 text-center space-y-1">
              <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-3" />
              <p className="text-lg font-semibold text-zinc-900">
                {results.manual ? 'Links gerados!' : 'Campanha concluída!'}
              </p>
              <p className="text-sm text-zinc-400">
                {results.manual
                  ? `${results.total} links prontos para envio manual`
                  : `${results.sent} de ${results.total} mensagens enviadas`
                }
                {results.skipped > 0 && ` · ${results.skipped} ignorados (sem contato prévio)`}
              </p>
            </div>

            {results.manual && manualLinks.length > 0 && (
              <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-100">
                  <p className="text-sm font-semibold text-zinc-900">Links para envio</p>
                </div>
                <div className="divide-y divide-zinc-50 max-h-96 overflow-y-auto">
                  {opportunities.filter(o => selected.has(o.id)).map((opp, i) => (
                    <div key={opp.id} className="flex items-center justify-between px-5 py-3">
                      <div>
                        <p className="text-sm font-medium text-zinc-900">{opp.patient.name}</p>
                        <p className="text-xs text-zinc-400">{opp.patient.phone}</p>
                      </div>
                      <a
                        href={manualLinks[i]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#25D366] hover:bg-[#1fba59] rounded-lg transition"
                      >
                        <ExternalLink size={11} />
                        Abrir
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={() => { setStep('select'); setSelected(new Set()); setResults(null); setManualLinks([]) }}
                className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 border border-zinc-200 rounded-lg transition"
              >
                Nova campanha
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  )
}