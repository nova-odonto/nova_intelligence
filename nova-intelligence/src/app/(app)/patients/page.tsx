'use client'

import { useState, useEffect, useCallback } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, relativeTime } from '@/lib/utils'
import {
  Search, Filter, Plus, Download, Upload,
  MessageSquare, History, ChevronDown, X, Loader2
} from 'lucide-react'
import { NewPatientModal } from './components/NewPatientModal'
import { PatientHistoryDrawer } from './components/PatientHistoryDrawer'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

const RISK_CONFIG = {
  critical: { label: 'Crítico',  variant: 'lost'    as const, dot: 'bg-red-500'    },
  high:     { label: 'Alto',     variant: 'warning'  as const, dot: 'bg-orange-400' },
  medium:   { label: 'Médio',    variant: 'active'   as const, dot: 'bg-blue-400'   },
  low:      { label: 'Baixo',    variant: 'won'      as const, dot: 'bg-green-500'  },
}

const RISK_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'critical', label: 'Crítico' },
  { value: 'high', label: 'Alto' },
  { value: 'medium', label: 'Médio' },
  { value: 'low', label: 'Baixo' },
]

export default function PatientsPage() {
  const [patients, setPatients] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, recoverable: 0, critical: 0, high: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)

  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ clinicId: CLINIC_ID })
      if (search) params.set('search', search)
      if (riskFilter) params.set('risk', riskFilter)
      const res = await fetch(`/api/patients?${params}`)
      const data = await res.json()
      setPatients(data.patients ?? [])
      setStats(data.stats ?? { total: 0, recoverable: 0, critical: 0, high: 0 })
    } finally {
      setLoading(false)
    }
  }, [search, riskFilter])

  useEffect(() => {
    const t = setTimeout(fetchPatients, 300)
    return () => clearTimeout(t)
  }, [fetchPatients])

  function exportCSV() {
    const headers = ['Nome', 'Telefone', 'E-mail', 'Canal', 'Último atendimento', 'Tratamento', 'Valor', 'Risco']
    const rows = patients.map(p => [
      p.name,
      p.phone ?? '',
      p.email ?? '',
      p.leadSource ?? '',
      p.lastVisitAt ? new Date(p.lastVisitAt).toLocaleDateString('pt-BR') : 'Nunca visitou',
      p.latestTreatment ?? '',
      p.latestValue ?? '',
      RISK_CONFIG[p.riskLevel as keyof typeof RISK_CONFIG]?.label ?? '',
    ])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pacientes_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Topbar title="Pacientes" subtitle="Gestão e recuperação de pacientes" />
      <main className="p-6 space-y-5">

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total',        value: stats.total,       color: 'text-zinc-900' },
            { label: 'Recuperáveis', value: stats.recoverable, color: 'text-orange-600' },
            { label: 'Críticos',     value: stats.critical,    color: 'text-red-600' },
            { label: 'Alto risco',   value: stats.high,        color: 'text-orange-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-zinc-100 px-4 py-3">
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nome, telefone ou e-mail..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#730021]/20 focus:border-[#730021]/40"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-500">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Risk filter */}
          <div className="relative">
            <button
              onClick={() => setFilterOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm border rounded-lg transition ${
                riskFilter
                  ? 'border-[#730021]/40 bg-[#730021]/5 text-[#730021]'
                  : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              <Filter size={14} />
              {riskFilter ? RISK_CONFIG[riskFilter as keyof typeof RISK_CONFIG]?.label : 'Filtrar'}
              <ChevronDown size={12} />
            </button>
            {filterOpen && (
              <div className="absolute top-full mt-1 left-0 bg-white border border-zinc-200 rounded-xl shadow-lg z-10 py-1 w-36">
                {RISK_FILTERS.map(f => (
                  <button
                    key={f.value}
                    onClick={() => { setRiskFilter(f.value); setFilterOpen(false) }}
                    className={`w-full text-left px-3 py-2 text-sm transition hover:bg-zinc-50 ${
                      riskFilter === f.value ? 'text-[#730021] font-medium' : 'text-zinc-600'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* Actions */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 rounded-lg transition"
          >
            <Download size={14} />
            Exportar
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition"
          >
            <Plus size={14} />
            Novo paciente
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Paciente</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Canal</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Último atendimento</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Tratamento</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Valor est.</th>
                <th className="text-left text-xs font-medium text-zinc-400 px-5 py-3">Risco</th>
                <th className="text-right text-xs font-medium text-zinc-400 px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-300 mx-auto" />
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-zinc-400">
                    Nenhum paciente encontrado
                  </td>
                </tr>
              ) : (
                patients.map(patient => {
                  const risk = RISK_CONFIG[patient.riskLevel as keyof typeof RISK_CONFIG]
                  const phone = patient.phone?.replace(/\D/g, '')
                  const waLink = phone ? `https://wa.me/55${phone}` : null

                  return (
                    <tr
                      key={patient.id}
                      className="border-b border-zinc-50 hover:bg-zinc-50/60 transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">{patient.name}</p>
                          <p className="text-xs text-zinc-400">{patient.phone ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        {patient.leadSource ? (
                          <Badge variant={patient.leadSource === 'MedPrev' ? 'active' : 'default'}>
                            {patient.leadSource}
                          </Badge>
                        ) : (
                          <span className="text-xs text-zinc-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-500">
                        {patient.lastVisitAt
                          ? relativeTime(patient.lastVisitAt)
                          : <span className="text-red-500 text-xs">Nunca visitou</span>
                        }
                      </td>
                      <td className="px-5 py-3.5 text-sm text-zinc-600">
                        {patient.latestTreatment ?? <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-zinc-800">
                        {patient.latestValue ? formatCurrency(patient.latestValue) : <span className="text-zinc-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {risk && (
                          <span className="inline-flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${risk.dot}`} />
                            <Badge variant={risk.variant}>{risk.label}</Badge>
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          {/* WhatsApp */}
                          {waLink && (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Abrir WhatsApp"
                              className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-[#25D366] hover:bg-green-50 transition"
                              onClick={e => e.stopPropagation()}
                            >
                              <MessageSquare size={15} />
                            </a>
                          )}
                          {/* Histórico */}
                          <button
                            title="Ver histórico"
                            onClick={() => setSelectedPatient(patient)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-[#730021] hover:bg-[#730021]/5 transition"
                          >
                            <History size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Footer */}
          {!loading && patients.length > 0 && (
            <div className="px-5 py-3 border-t border-zinc-50">
              <p className="text-xs text-zinc-400">
                {patients.length} paciente{patients.length !== 1 ? 's' : ''}
                {riskFilter && ` · filtrado por ${RISK_CONFIG[riskFilter as keyof typeof RISK_CONFIG]?.label.toLowerCase()}`}
                {search && ` · "${search}"`}
              </p>
            </div>
          )}
        </div>
      </main>

      {modalOpen && (
        <NewPatientModal
          clinicId={CLINIC_ID}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); fetchPatients() }}
        />
      )}

      {selectedPatient && (
        <PatientHistoryDrawer
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </>
  )
}