'use client'

import { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'

interface NewPatientModalProps {
  clinicId: string
  onClose: () => void
  onSaved: () => void
}

export function NewPatientModal({ clinicId, onClose, onSaved }: NewPatientModalProps) {
  const [loading, setLoading] = useState(false)
  const [leadSources, setLeadSources] = useState<{ id: string; name: string }[]>([])
  const [form, setForm] = useState({
    name: '', phone: '', email: '', cpf: '', birthDate: '', leadSourceId: ''
  })

  useEffect(() => {
    fetch(`/api/lead-sources?clinicId=${clinicId}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setLeadSources(data))
      .catch(() => {})
  }, [clinicId])

  async function handleSubmit() {
    if (!form.name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) onSaved()
    } finally {
      setLoading(false)
    }
  }

  const field = (label: string, key: keyof typeof form, type = 'text', placeholder = '') => (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#730021]/20 focus:border-[#730021]/40 placeholder:text-zinc-300"
      />
    </div>
  )

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Novo Paciente</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Preencha os dados do paciente</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 transition">
              <X size={16} />
            </button>
          </div>

          <div className="px-6 py-5 space-y-4">
            {field('Nome completo *', 'name', 'text', 'Ex: Maria Silva')}
            <div className="grid grid-cols-2 gap-3">
              {field('Telefone', 'phone', 'tel', '(63) 9 9999-9999')}
              {field('CPF', 'cpf', 'text', '000.000.000-00')}
            </div>
            {field('E-mail', 'email', 'email', 'paciente@email.com')}
            <div className="grid grid-cols-2 gap-3">
              {field('Data de nascimento', 'birthDate', 'date')}
              <div className="space-y-1">
                <label className="text-xs font-medium text-zinc-500">Canal de origem</label>
                <select
                  value={form.leadSourceId}
                  onChange={e => setForm(f => ({ ...f, leadSourceId: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#730021]/20 focus:border-[#730021]/40 text-zinc-600"
                >
                  <option value="">Selecionar</option>
                  {leadSources.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-zinc-100 flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.name.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Salvar paciente
            </button>
          </div>
        </div>
      </div>
    </>
  )
}