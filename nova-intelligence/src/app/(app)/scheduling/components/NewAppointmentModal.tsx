'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'

interface Props {
  clinicId: string
  initialSlot: { start: Date; end: Date } | null
  onClose: () => void
  onSaved: () => void
}

export function NewAppointmentModal({ clinicId, initialSlot, onClose, onSaved }: Props) {
  const [dentists, setDentists] = useState<any[]>([])
  const [patients, setPatients] = useState<any[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  const [form, setForm] = useState({
    patientId: '',
    dentistId: '',
    date: initialSlot ? format(initialSlot.start, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    time: initialSlot ? format(initialSlot.start, 'HH:mm') : '',
    type: 'consulta',
    notes: ''
  })

  useEffect(() => {
    fetchDentists()
    fetchPatients()
  }, [])

  useEffect(() => {
    if (form.dentistId && form.date) fetchSlots()
  }, [form.dentistId, form.date])

  async function fetchDentists() {
    const res = await fetch(`/api/scheduling/dentists?clinicId=${clinicId}`)
    if (res.ok) setDentists(await res.json())
  }

  async function fetchPatients() {
    const res = await fetch(`/api/patients?clinicId=${clinicId}`)
    if (res.ok) {
      const data = await res.json()
      setPatients(Array.isArray(data) ? data : (data.patients ?? []))
    }
  }

  async function fetchSlots() {
    const res = await fetch(
      `/api/scheduling/available-slots?dentistId=${form.dentistId}&date=${form.date}`
    )
    if (res.ok) {
      const data = await res.json()
      setSlots(data.slots)
    }
  }

  async function handleSubmit() {
    if (!form.patientId || !form.dentistId || !form.date || !form.time) return
    setLoading(true)
    const res = await fetch('/api/scheduling/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, clinicId })
    })
    setLoading(false)
    if (res.ok) onSaved()
  }

  async function handleAI() {
    if (!aiMessage.trim()) return
    setAiLoading(true)
    setAiResponse('')
    try {
      const res = await fetch('/api/scheduling/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: aiMessage, clinicId, dentistId: form.dentistId })
      })
      const data = await res.json()
      setAiResponse(data.suggestion)
      if (data.date) setForm(f => ({ ...f, date: data.date }))
      if (data.time) setForm(f => ({ ...f, time: data.time }))
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-y-auto max-h-[90vh]">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-900">Novo Agendamento</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600 text-xl">✕</button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* AI Suggest */}
          <div className="bg-indigo-50 rounded-xl p-4 flex flex-col gap-2">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">✦ Sugestão por IA</p>
            <div className="flex gap-2">
              <input
                className="flex-1 text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder='Ex: "Agendar retorno da Ana para semana que vem de manhã"'
                value={aiMessage}
                onChange={e => setAiMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAI()}
              />
              <button
                onClick={handleAI}
                disabled={aiLoading}
                className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {aiLoading ? '...' : 'Enviar'}
              </button>
            </div>
            {aiResponse && (
              <p className="text-sm text-indigo-800 bg-indigo-100 rounded-lg px-3 py-2">{aiResponse}</p>
            )}
          </div>

          {/* Paciente */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">Paciente</label>
            <select
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.patientId}
              onChange={e => setForm(f => ({ ...f, patientId: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          {/* Dentista */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">Dentista</label>
            <select
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.dentistId}
              onChange={e => setForm(f => ({ ...f, dentistId: e.target.value }))}
            >
              <option value="">Selecione...</option>
              {dentists.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Data</label>
              <input
                type="date"
                className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-zinc-500">Horário</label>
              <select
                className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              >
                <option value="">Selecione...</option>
                {slots.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">Tipo</label>
            <select
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            >
              <option value="consulta">Consulta</option>
              <option value="retorno">Retorno</option>
              <option value="implante">Implante</option>
              <option value="ortodontia">Ortodontia</option>
              <option value="limpeza">Limpeza</option>
              <option value="extracao">Extração</option>
            </select>
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-zinc-500">Observações</label>
            <textarea
              className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              rows={2}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? 'Agendando...' : 'Confirmar agendamento'}
          </button>
        </div>
      </div>
    </div>
  )
}