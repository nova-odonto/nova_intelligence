'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/layout/topbar'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { MessageSquare, Plus, Loader2, X, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

const COLUMNS = [
  { id: 'ACTIVE',    label: 'Ativo',      color: 'bg-blue-500',    dot: 'bg-blue-500'    },
  { id: 'WON',       label: 'Ganho',      color: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { id: 'RECOVERED', label: 'Recuperado', color: 'bg-indigo-500',  dot: 'bg-indigo-500'  },
  { id: 'LOST',      label: 'Perdido',    color: 'bg-red-500',     dot: 'bg-red-500'     },
]

const STATUS_ACTIONS: Record<string, { label: string; status: string; style: string }[]> = {
  ACTIVE: [
    { label: 'Marcar como ganho',      status: 'WON',       style: 'text-emerald-600 hover:bg-emerald-50' },
    { label: 'Marcar como recuperado', status: 'RECOVERED', style: 'text-indigo-600 hover:bg-indigo-50'   },
    { label: 'Marcar como perdido',    status: 'LOST',      style: 'text-red-500 hover:bg-red-50'         },
  ],
  WON: [
    { label: 'Reabrir',        status: 'ACTIVE', style: 'text-blue-600 hover:bg-blue-50'  },
  ],
  RECOVERED: [
    { label: 'Marcar como ganho', status: 'WON',   style: 'text-emerald-600 hover:bg-emerald-50' },
    { label: 'Reabrir',           status: 'ACTIVE', style: 'text-blue-600 hover:bg-blue-50'       },
  ],
  LOST: [
    { label: 'Tentar recuperar', status: 'ACTIVE', style: 'text-indigo-600 hover:bg-indigo-50' },
  ],
}

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [newOppModal, setNewOppModal] = useState(false)

  useEffect(() => {
    fetchOpportunities()
  }, [])

  async function fetchOpportunities() {
    setLoading(true)
    try {
      const res = await fetch(`/api/opportunities?clinicId=${CLINIC_ID}`)
      const data = await res.json()
      setOpportunities(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setActionLoading(id)
    setOpenMenu(null)
    try {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        const updated = await res.json()
        setOpportunities(prev => prev.map(o => o.id === id ? updated : o))
      }
    } finally {
      setActionLoading(null)
    }
  }

  function getWhatsAppLink(phone: string) {
    const clean = phone?.replace(/\D/g, '')
    return clean ? `https://wa.me/55${clean}` : null
  }

  function daysSince(date: string | null) {
    if (!date) return null
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  }

  const byStatus = (status: string) => opportunities.filter(o => o.status === status)
  const totalValue = (status: string) => byStatus(status).reduce((s, o) => s + o.estimatedValue, 0)

  return (
    <>
      <Topbar title="Oportunidades" subtitle="Pipeline de tratamentos e recuperação" />
      <main className="p-6 space-y-4">

        {/* Header */}
        <div className="flex justify-end">
          <button
            onClick={() => setNewOppModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition"
          >
            <Plus size={14} />
            Nova oportunidade
          </button>
        </div>

        {/* Kanban */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {COLUMNS.map(col => {
              const items = byStatus(col.id)
              const total = totalValue(col.id)
              return (
                <div key={col.id}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                      <span className="text-sm font-medium text-zinc-700">{col.label}</span>
                      <span className="text-xs text-zinc-400 bg-zinc-100 rounded-full px-1.5">{items.length}</span>
                    </div>
                    <span className="text-xs font-medium text-zinc-500">{formatCurrency(total)}</span>
                  </div>

                  <div className="space-y-2">
                    {items.length === 0 && (
                      <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-4 text-center">
                        <p className="text-xs text-zinc-300">Nenhuma</p>
                      </div>
                    )}
                    {items.map(opp => {
                      const days = daysSince(opp.lastContactAt ?? opp.createdAt)
                      const waLink = getWhatsAppLink(opp.patient?.phone)
                      const isLoading = actionLoading === opp.id
                      const actions = STATUS_ACTIONS[opp.status] ?? []

                      return (
                        <div
                          key={opp.id}
                          className="bg-white border border-zinc-100 rounded-xl p-4 hover:border-zinc-200 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-zinc-900 truncate">{opp.patient?.name}</p>
                              <p className="text-xs text-zinc-400 mt-0.5">{opp.treatmentName}</p>
                            </div>
                            {/* Menu de ações */}
                            {actions.length > 0 && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={() => setOpenMenu(openMenu === opp.id ? null : opp.id)}
                                  className="w-6 h-6 flex items-center justify-center rounded text-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition"
                                >
                                  {isLoading
                                    ? <Loader2 size={12} className="animate-spin" />
                                    : <ChevronDown size={12} />
                                  }
                                </button>
                                {openMenu === opp.id && (
                                  <div className="absolute right-0 top-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg z-20 py-1 w-48">
                                    {actions.map(a => (
                                      <button
                                        key={a.status}
                                        onClick={() => updateStatus(opp.id, a.status)}
                                        className={`w-full text-left px-3 py-2 text-xs transition ${a.style}`}
                                      >
                                        {a.label}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1.5">
                              {opp.leadSource?.name && (
                                <Badge variant="default">{opp.leadSource.name}</Badge>
                              )}
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-6 h-6 flex items-center justify-center rounded text-zinc-300 hover:text-[#25D366] transition"
                                  title="Abrir WhatsApp"
                                >
                                  <MessageSquare size={12} />
                                </a>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-zinc-800">
                              {formatCurrency(opp.estimatedValue)}
                            </span>
                          </div>

                          {/* Alerta de inatividade */}
                          {opp.status === 'ACTIVE' && days !== null && days > 30 && (
                            <div className="mt-2 pt-2 border-t border-zinc-50">
                              <p className="text-[11px] text-amber-600">
                                {days}d sem contato
                              </p>
                            </div>
                          )}

                          {/* Notas */}
                          {opp.notes && (
                            <p className="mt-2 text-[11px] text-zinc-400 line-clamp-2">{opp.notes}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {newOppModal && (
        <NewOpportunityModal
          onClose={() => setNewOppModal(false)}
          onSaved={() => { setNewOppModal(false); fetchOpportunities() }}
        />
      )}

      {/* Fechar menus ao clicar fora */}
      {openMenu && (
        <div className="fixed inset-0 z-10" onClick={() => setOpenMenu(null)} />
      )}
    </>
  )
}

// ─── Modal de nova oportunidade ──────────────────────────────

function NewOpportunityModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [patients, setPatients] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    patientId: '', treatmentName: '', estimatedValue: '', notes: ''
  })

  useEffect(() => {
    fetch(`/api/patients?clinicId=${CLINIC_ID}`)
      .then(r => r.json())
      .then(d => setPatients(Array.isArray(d) ? d : (d.patients ?? [])))
  }, [])

  async function handleSubmit() {
    if (!form.patientId || !form.treatmentName || !form.estimatedValue) return
    setLoading(true)
    try {
      const res = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) onSaved()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="text-base font-semibold text-zinc-900">Nova oportunidade</h2>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 transition">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Paciente</label>
              <select
                value={form.patientId}
                onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20"
              >
                <option value="">Selecionar...</option>
                {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Tratamento</label>
              <input
                value={form.treatmentName}
                onChange={e => setForm(f => ({ ...f, treatmentName: e.target.value }))}
                placeholder="Ex: Implante, Ortodontia, Facetas..."
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Valor estimado (R$)</label>
              <input
                type="number"
                value={form.estimatedValue}
                onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))}
                placeholder="0,00"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Observações</label>
              <textarea
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20 resize-none"
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-zinc-100 flex gap-2 justify-end">
            <button onClick={onClose} className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 rounded-lg transition">
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.patientId || !form.treatmentName || !form.estimatedValue}
              className="px-4 py-2 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Salvar
            </button>
          </div>
        </div>
      </div>
    </>
  )
}