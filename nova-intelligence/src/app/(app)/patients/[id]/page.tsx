'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Topbar } from '@/components/layout/topbar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'
import {
  ArrowLeft, Phone, Mail, Calendar, MapPin,
  Loader2, Save, MessageSquare, Activity, FileText, Stethoscope
} from 'lucide-react'

// ─── Configs ──────────────────────────────────────────────

const TOOTH_STATUS_CONFIG = {
  HEALTHY:    { label: 'Saudável',     fill: '#f0fdf4', stroke: '#86efac', text: '#16a34a' },
  CAVITY:     { label: 'Cárie',        fill: '#fef2f2', stroke: '#fca5a5', text: '#dc2626' },
  TREATED:    { label: 'Tratado',      fill: '#f0fdf4', stroke: '#4ade80', text: '#15803d' },
  TO_EXTRACT: { label: 'Para extrair', fill: '#fff7ed', stroke: '#fdba74', text: '#ea580c' },
  EXTRACTED:  { label: 'Extraído',     fill: '#f4f4f5', stroke: '#a1a1aa', text: '#71717a' },
  IMPLANT:    { label: 'Implante',     fill: '#eff6ff', stroke: '#93c5fd', text: '#2563eb' },
}

const APPOINTMENT_STATUS: Record<string, { label: string; color: string }> = {
  SCHEDULED:  { label: 'Agendado',       color: 'text-blue-600 bg-blue-50'    },
  CONFIRMED:  { label: 'Confirmado',     color: 'text-green-600 bg-green-50'  },
  COMPLETED:  { label: 'Concluído',      color: 'text-zinc-500 bg-zinc-100'   },
  CANCELLED:  { label: 'Cancelado',      color: 'text-red-500 bg-red-50'      },
  NO_SHOW:    { label: 'Não compareceu', color: 'text-orange-500 bg-orange-50' },
}

const UPPER_TEETH = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28]
const LOWER_TEETH = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]

// Classifica dente: molar, premolar, canino, incisivo
function toothType(n: number): 'molar' | 'premolar' | 'canino' | 'incisivo' {
  const last = n % 10
  if (last >= 6) return 'molar'
  if (last >= 4) return 'premolar'
  if (last === 3) return 'canino'
  return 'incisivo'
}

// SVG de dente por tipo
function ToothSVG({ number, record, isSelected, onClick }: {
  number: number
  record: any
  isSelected: boolean
  onClick: () => void
}) {
  const type = toothType(number)
  const config = record ? TOOTH_STATUS_CONFIG[record.status as keyof typeof TOOTH_STATUS_CONFIG] : null
  const fill = config?.fill ?? '#fafafa'
  const stroke = isSelected ? '#730021' : (config?.stroke ?? '#d4d4d8')
  const strokeWidth = isSelected ? 2 : 1.5

  let path = ''
  if (type === 'molar') {
    path = 'M4,2 C4,1 5,0.5 8,0.5 C11,0.5 12,1 12,2 L13,10 C13,11.5 11,13 8,13 C5,13 3,11.5 3,10 Z M5,3 L11,3 M5,5 L11,5'
  } else if (type === 'premolar') {
    path = 'M5,1 C5,0.5 6,0 8,0 C10,0 11,0.5 11,1 L12,10 C12,11.5 10,13 8,13 C6,13 4,11.5 4,10 Z M6,3 L10,3'
  } else if (type === 'canino') {
    path = 'M8,0 C8,0 11,2 11,6 C11,10 9.5,13 8,13 C6.5,13 5,10 5,6 C5,2 8,0 8,0 Z'
  } else {
    path = 'M6,0.5 C6,0.5 7,0 8,0 C9,0 10,0.5 10,0.5 L10.5,10 C10.5,11.5 9.5,13 8,13 C6.5,13 5.5,11.5 5.5,10 Z'
  }

  // Raiz
  const root = type === 'molar'
    ? 'M5,13 L4.5,20 M8,13 L8,21 M11,13 L11.5,20'
    : type === 'premolar'
    ? 'M6,13 L5.5,21 M10,13 L10.5,21'
    : 'M8,13 L8,22'

  return (
    <div className="flex flex-col items-center gap-0.5 cursor-pointer group" onClick={onClick}>
      <svg
        viewBox="0 0 16 24"
        width="28"
        height="42"
        className="transition-transform group-hover:scale-110"
        style={{ filter: isSelected ? 'drop-shadow(0 0 3px #730021aa)' : undefined }}
      >
        {/* Raiz */}
        <path d={root} stroke={stroke} strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.5" />
        {/* Coroa */}
        <path d={path} fill={fill} stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" />
        {/* Indicador de status */}
        {record?.status === 'EXTRACTED' && (
          <>
            <line x1="4" y1="4" x2="12" y2="12" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="12" y1="4" x2="4" y2="12" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {record?.status === 'IMPLANT' && (
          <circle cx="8" cy="6.5" r="2.5" fill="#93c5fd" stroke="#3b82f6" strokeWidth="1" />
        )}
      </svg>
      <span className={`text-[9px] font-medium transition-colors ${isSelected ? 'text-[#730021]' : 'text-zinc-400'}`}>
        {number}
      </span>
    </div>
  )
}

// ─── Página principal ─────────────────────────────────────

export default function PatientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.id as string

  const [patient, setPatient] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'overview' | 'anamnesis' | 'odontogram'>('overview')

  useEffect(() => { fetchPatient() }, [patientId])

  async function fetchPatient() {
    setLoading(true)
    try {
      const res = await fetch(`/api/patients/${patientId}`)
      if (res.ok) setPatient(await res.json())
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <>
      <Topbar />
      <main className="p-6 flex justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-zinc-300" />
      </main>
    </>
  )

  if (!patient) return (
    <>
      <Topbar />
      <main className="p-6 text-center text-sm text-zinc-400 py-20">Paciente não encontrado</main>
    </>
  )

  const phone = patient.phone?.replace(/\D/g, '')
  const waLink = phone ? `https://wa.me/55${phone}` : null

  return (
    <>
      <Topbar title={patient.name} subtitle="Ficha do paciente" />
      <main className="p-6 space-y-5 max-w-5xl">

        <div className="flex items-start justify-between">
          <button
            onClick={() => router.push('/patients')}
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 transition"
          >
            <ArrowLeft size={14} /> Pacientes
          </button>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#25D366] hover:bg-[#1fba59] rounded-lg transition">
              <MessageSquare size={14} /> WhatsApp
            </a>
          )}
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-zinc-100 p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#730021]/10 flex items-center justify-center shrink-0">
              <span className="text-lg font-bold text-[#730021]">
                {patient.name.split(' ').slice(0,2).map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-zinc-900">{patient.name}</h1>
              <div className="flex flex-wrap gap-4 mt-2">
                {patient.phone && <span className="flex items-center gap-1.5 text-sm text-zinc-500"><Phone size={13} className="text-zinc-300" />{patient.phone}</span>}
                {patient.email && <span className="flex items-center gap-1.5 text-sm text-zinc-500"><Mail size={13} className="text-zinc-300" />{patient.email}</span>}
                {patient.birthDate && <span className="flex items-center gap-1.5 text-sm text-zinc-500"><Calendar size={13} className="text-zinc-300" />{format(new Date(patient.birthDate), 'dd/MM/yyyy')}</span>}
                {patient.leadSource?.name && <span className="flex items-center gap-1.5 text-sm text-zinc-500"><MapPin size={13} className="text-zinc-300" />{patient.leadSource.name}</span>}
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              {[
                { label: 'Consultas', value: patient.appointments?.length ?? 0 },
                { label: 'Oportunidades', value: patient.opportunities?.length ?? 0 },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-semibold text-zinc-900">{s.value}</p>
                  <p className="text-[11px] text-zinc-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl w-fit">
          {[
            { id: 'overview',   label: 'Visão geral', icon: Activity    },
            { id: 'anamnesis',  label: 'Anamnese',    icon: FileText    },
            { id: 'odontogram', label: 'Odontograma', icon: Stethoscope },
          ].map(t => {
            const Icon = t.icon
            return (
              <button key={t.id} type="button" onClick={() => setTab(t.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${tab === t.id ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}>
                <Icon size={14} />{t.label}
              </button>
            )
          })}
        </div>

        {tab === 'overview'   && <OverviewTab patient={patient} />}
        {tab === 'anamnesis'  && <AnamnesisTab patientId={patientId} initial={patient.anamnesis} />}
        {tab === 'odontogram' && <OdontogramTab patientId={patientId} initial={patient.toothRecords ?? []} />}
      </main>
    </>
  )
}

// ─── Visão Geral ──────────────────────────────────────────

function OverviewTab({ patient }: { patient: any }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-900">Histórico de consultas</p>
        </div>
        <div className="divide-y divide-zinc-50 max-h-80 overflow-y-auto">
          {patient.appointments?.length === 0
            ? <p className="text-sm text-zinc-400 text-center py-8">Nenhuma consulta registrada</p>
            : patient.appointments?.map((apt: any) => {
                const st = APPOINTMENT_STATUS[apt.status] ?? { label: apt.status, color: 'text-zinc-600 bg-zinc-100' }
                return (
                  <div key={apt.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-800 capitalize">{apt.type}</p>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {format(new Date(apt.startAt), "d MMM yyyy 'às' HH:mm", { locale: ptBR })}
                        {apt.dentist?.name && ` · ${apt.dentist.name}`}
                      </p>
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${st.color}`}>{st.label}</span>
                  </div>
                )
              })
          }
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-zinc-100">
          <p className="text-sm font-semibold text-zinc-900">Tratamentos / Oportunidades</p>
        </div>
        <div className="divide-y divide-zinc-50 max-h-80 overflow-y-auto">
          {patient.opportunities?.length === 0
            ? <p className="text-sm text-zinc-400 text-center py-8">Nenhuma oportunidade registrada</p>
            : patient.opportunities?.map((opp: any) => (
                <div key={opp.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-800">{opp.treatmentName}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{format(new Date(opp.createdAt), 'dd/MM/yyyy', { locale: ptBR })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-zinc-800">{formatCurrency(opp.estimatedValue)}</p>
                    <span className={`text-[11px] font-medium ${opp.status === 'WON' ? 'text-green-600' : opp.status === 'LOST' ? 'text-red-500' : opp.status === 'RECOVERED' ? 'text-indigo-600' : 'text-blue-600'}`}>
                      {opp.status === 'WON' ? 'Ganho' : opp.status === 'LOST' ? 'Perdido' : opp.status === 'RECOVERED' ? 'Recuperado' : 'Ativo'}
                    </span>
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}

// ─── Anamnese ─────────────────────────────────────────────

function AnamnesisTab({ patientId, initial }: { patientId: string; initial: any }) {
  const [form, setForm] = useState(initial ?? {})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(key: string) {
    setForm((f: any) => ({ ...f, [key]: !f[key] }))
    setSaved(false)
  }

  function setText(key: string, value: string) {
    setForm((f: any) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await fetch(`/api/patients/${patientId}/anamnesis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const Check = ({ field }: { field: string }) => (
    <button
      type="button"
      onClick={() => toggle(field)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition shrink-0 ${form[field] ? 'bg-[#730021] border-[#730021]' : 'border-zinc-300 hover:border-zinc-400'}`}
    >
      {form[field] && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  )

  const Row = ({ field, label, detail }: { field: string; label: string; detail?: string }) => (
    <div className="flex items-start gap-3">
      <Check field={field} />
      <div className="flex-1">
        <span className="text-sm text-zinc-700 leading-tight">{label}</span>
        {detail && form[field] && (
          <input
            key={detail}
            defaultValue={form[detail] ?? ''}
            onBlur={e => setText(detail, e.target.value)}
            placeholder="Descreva..."
            className="mt-1.5 w-full text-xs px-2.5 py-1.5 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20"
          />
        )}
      </div>
    </div>
  )

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-zinc-900">{title}</p>
      <div className="grid grid-cols-2 gap-4">{children}</div>
    </div>
  )

  return (
    <div className="space-y-4">
      <Section title="Hábitos Diários">
        <Row field="smoker"           label="Tabagismo" />
        <Row field="alcoholic"        label="Ingere bebida alcoólica" />
        <Row field="brushDaily"       label="Escova os dentes todo dia" />
        <Row field="flossDaily"       label="Fio dental todos os dias" />
        <Row field="physicalActivity" label="Pratica atividade física" />
        <Row field="sleepProblems"    label="Problemas com sono" />
      </Section>

      <Section title="Condições do Paciente">
        <Row field="allergicToMedication" label="Alergia a medicamentos" detail="allergicDetail" />
        <Row field="hadSurgery"           label="Fez cirurgia"           detail="surgeryDetail" />
        <Row field="pregnant"             label="Gestante" />
      </Section>

      <Section title="Doenças Cardiovasculares">
        <Row field="hypertension"       label="Hipertensão arterial" />
        <Row field="cardiopathy"        label="Cardiopatia congênita" />
        <Row field="peripheralArterial" label="Doença arterial periférica" />
      </Section>

      <Section title="Histórico Familiar">
        <Row field="familyCancer"       label="Câncer" />
        <Row field="familyDiabetes"     label="Diabetes" />
        <Row field="familyHypertension" label="Pressão Alta" />
        <Row field="familyOther"        label="Outras doenças" detail="familyOtherDetail" />
      </Section>

      <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-3">
        <p className="text-sm font-semibold text-zinc-900">Medicamentos em uso</p>
        <textarea value={form.medications ?? ''} onChange={e => setText('medications', e.target.value)}
          placeholder="Liste os medicamentos em uso..." rows={3}
          className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#730021]/20 resize-none" />
      </div>

      <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-3">
        <p className="text-sm font-semibold text-zinc-900">Observações gerais</p>
        <textarea value={form.notes ?? ''} onChange={e => setText('notes', e.target.value)}
          placeholder="Observações adicionais..." rows={3}
          className="w-full text-sm px-3 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#730021]/20 resize-none" />
      </div>

      <div className="flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saved ? 'Salvo!' : 'Salvar anamnese'}
        </button>
      </div>
    </div>
  )
}

// ─── Odontograma ──────────────────────────────────────────

function OdontogramTab({ patientId, initial }: { patientId: string; initial: any[] }) {
  const [records, setRecords] = useState<Record<number, any>>(() => {
    const map: Record<number, any> = {}
    initial.forEach(r => { map[r.toothNumber] = r })
    return map
  })
  const [selected, setSelected] = useState<number | null>(null)
  const [form, setForm] = useState({ status: 'CAVITY', description: '', notes: '' })
  const [saving, setSaving] = useState(false)

  function selectTooth(n: number) {
    setSelected(n)
    const existing = records[n]
    setForm(existing
      ? { status: existing.status, description: existing.description ?? '', notes: existing.notes ?? '' }
      : { status: 'CAVITY', description: '', notes: '' }
    )
  }

  async function saveTooth() {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/patients/${patientId}/teeth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toothNumber: selected, ...form })
      })
      const data = await res.json()
      setRecords(prev => ({ ...prev, [selected]: data }))
    } finally {
      setSaving(false)
    }
  }

  async function removeTooth() {
    if (!selected) return
    await fetch(`/api/patients/${patientId}/teeth`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toothNumber: selected })
    })
    setRecords(prev => { const next = { ...prev }; delete next[selected]; return next })
    setSelected(null)
  }

  return (
    <div className="space-y-4">
      {/* Arcada */}
      <div className="bg-white rounded-2xl border border-zinc-100 p-6 space-y-6">
        {/* Legenda */}
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.entries(TOOTH_STATUS_CONFIG).map(([key, val]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs" style={{ color: val.text }}>
              <span className="w-3 h-3 rounded-sm border" style={{ backgroundColor: val.fill, borderColor: val.stroke }} />
              {val.label}
            </span>
          ))}
        </div>

        {/* Superior */}
        <div>
          <p className="text-[10px] text-zinc-400 text-center mb-2 uppercase tracking-widest">Superior</p>
          <div className="flex justify-center gap-0.5 flex-wrap">
            {UPPER_TEETH.map(n => (
              <ToothSVG key={n} number={n} record={records[n]} isSelected={selected === n} onClick={() => selectTooth(n)} />
            ))}
          </div>
        </div>

        <div className="border-t border-dashed border-zinc-200 mx-8" />

        {/* Inferior — dentes virados (raiz embaixo) */}
        <div>
          <div className="flex justify-center gap-0.5 flex-wrap" style={{ transform: 'scaleY(-1)' }}>
            {LOWER_TEETH.map(n => (
              <div key={n} style={{ transform: 'scaleY(-1)' }}>
                <ToothSVG number={n} record={records[n]} isSelected={selected === n} onClick={() => selectTooth(n)} />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-zinc-400 text-center mt-2 uppercase tracking-widest">Inferior</p>
        </div>
      </div>

      {/* Painel de edição */}
      {selected && (
        <div className="bg-white rounded-2xl border border-zinc-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-zinc-900">
              Dente {selected}
              {records[selected] && (
                <span className="ml-2 text-xs font-normal px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: TOOTH_STATUS_CONFIG[records[selected].status as keyof typeof TOOTH_STATUS_CONFIG]?.fill,
                    color: TOOTH_STATUS_CONFIG[records[selected].status as keyof typeof TOOTH_STATUS_CONFIG]?.text,
                  }}>
                  {TOOTH_STATUS_CONFIG[records[selected].status as keyof typeof TOOTH_STATUS_CONFIG]?.label}
                </span>
              )}
            </p>
            {records[selected] && (
              <button type="button" onClick={removeTooth} className="text-xs text-red-400 hover:text-red-600 transition">
                Remover registro
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20">
                {Object.entries(TOOTH_STATUS_CONFIG).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-500">Descrição do procedimento</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Restauração face mesial"
                className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-500">Observações</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Observações adicionais..."
              className="w-full px-3 py-2 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#730021]/20" />
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={saveTooth} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#730021] hover:bg-[#8a0027] rounded-lg transition disabled:opacity-50">
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Salvar dente {selected}
            </button>
          </div>
        </div>
      )}

      {/* Tabela de registros */}
      {Object.keys(records).length > 0 && (
        <div className="bg-white rounded-2xl border border-zinc-100 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-zinc-100">
            <p className="text-sm font-semibold text-zinc-900">Registros do odontograma</p>
          </div>
          <div className="divide-y divide-zinc-50">
            {Object.values(records).sort((a: any, b: any) => a.toothNumber - b.toothNumber).map((r: any) => {
              const config = TOOTH_STATUS_CONFIG[r.status as keyof typeof TOOTH_STATUS_CONFIG]
              return (
                <div key={r.toothNumber} onClick={() => selectTooth(r.toothNumber)}
                  className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-zinc-50 transition">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border"
                    style={{ backgroundColor: config.fill, borderColor: config.stroke, color: config.text }}>
                    {r.toothNumber}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-zinc-800">{config.label}</p>
                    {r.description && <p className="text-xs text-zinc-400">{r.description}</p>}
                  </div>
                  {r.notes && <p className="text-xs text-zinc-400 max-w-xs truncate">{r.notes}</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}