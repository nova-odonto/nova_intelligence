'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { X, User, Stethoscope, Clock, FileText, Smartphone, Calendar, Loader2, CheckCircle2, UserCheck, XCircle, AlertCircle } from 'lucide-react'

interface AppointmentDetailDrawerProps {
  appointment: any
  onClose: () => void
  onStatusChanged?: () => void
}

const STATUS_LABEL: Record<string, string> = {
  SCHEDULED:  'Agendado',
  CONFIRMED:  'Confirmado',
  CANCELLED:  'Cancelado',
  COMPLETED:  'Concluído',
  NO_SHOW:    'Não compareceu',
}

const STATUS_COLOR: Record<string, string> = {
  SCHEDULED:  'bg-blue-50 text-blue-700 border-blue-200',
  CONFIRMED:  'bg-green-50 text-green-700 border-green-200',
  CANCELLED:  'bg-red-50 text-red-700 border-red-200',
  COMPLETED:  'bg-zinc-100 text-zinc-600 border-zinc-200',
  NO_SHOW:    'bg-orange-50 text-orange-700 border-orange-200',
}

const ACTIONS: Record<string, { status: string; label: string; icon: any; style: string }[]> = {
  SCHEDULED: [
    { status: 'CONFIRMED',  label: 'Confirmar chegada',     icon: UserCheck,    style: 'bg-green-600 hover:bg-green-700 text-white' },
    { status: 'NO_SHOW',    label: 'Não compareceu',        icon: AlertCircle,  style: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { status: 'CANCELLED',  label: 'Cancelar',               icon: XCircle,      style: 'border border-red-200 text-red-600 hover:bg-red-50' },
  ],
  CONFIRMED: [
    { status: 'COMPLETED',  label: 'Concluir atendimento',  icon: CheckCircle2, style: 'bg-[#730021] hover:bg-[#8a0027] text-white' },
    { status: 'NO_SHOW',    label: 'Não compareceu',        icon: AlertCircle,  style: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { status: 'CANCELLED',  label: 'Cancelar',               icon: XCircle,      style: 'border border-red-200 text-red-600 hover:bg-red-50' },
  ],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [
    { status: 'SCHEDULED',  label: 'Reagendar',             icon: Calendar,     style: 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50' },
  ],
}

export function AppointmentDetailDrawer({ appointment, onClose, onStatusChanged }: AppointmentDetailDrawerProps) {
  const [resource, setResource] = useState(appointment.resource)
  const [loading, setLoading] = useState<string | null>(null)

  const start = new Date(resource.startAt)
  const end = new Date(resource.endAt)
  const status = resource.status as string
  const actions = ACTIONS[status] ?? []

  async function handleAction(newStatus: string) {
    setLoading(newStatus)
    try {
      const res = await fetch(`/api/scheduling/appointments/${resource.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        const updated = await res.json()
        setResource(updated)
        onStatusChanged?.()
      }
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-[380px] bg-white border-l border-zinc-200 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wide font-medium">Agendamento</p>
            <h2 className="text-base font-semibold text-zinc-900 mt-0.5">
              {format(start, "d 'de' MMMM", { locale: ptBR })}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${STATUS_COLOR[status] ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
            {STATUS_LABEL[status] ?? status}
            {resource.createdViaAI && (
              <span className="ml-1 text-[10px] opacity-60">· via WhatsApp</span>
            )}
          </span>

          {/* Ações */}
          {actions.length > 0 && (
            <div className="space-y-2">
              {actions.map(action => {
                const Icon = action.icon
                const isLoading = loading === action.status
                return (
                  <button
                    key={action.status}
                    onClick={() => handleAction(action.status)}
                    disabled={loading !== null}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${action.style}`}
                  >
                    {isLoading
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Icon size={14} />
                    }
                    {action.label}
                  </button>
                )
              })}
            </div>
          )}

          <div className="h-px bg-zinc-100" />

          {/* Paciente */}
          <div className="space-y-1">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
              <User size={11} />
              Paciente
            </p>
            <p className="text-sm font-semibold text-zinc-900">{resource.patient?.name ?? '—'}</p>
            {resource.patient?.phone && (
              <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                <Smartphone size={12} className="text-zinc-300" />
                {resource.patient.phone}
              </p>
            )}
          </div>

          <div className="h-px bg-zinc-100" />

          {/* Procedimento */}
          <div className="space-y-1">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
              <Stethoscope size={11} />
              Procedimento
            </p>
            <p className="text-sm font-semibold text-zinc-900 capitalize">{resource.type ?? '—'}</p>
          </div>

          {/* Dentista */}
          {resource.dentist && (
            <>
              <div className="h-px bg-zinc-100" />
              <div className="space-y-1">
                <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
                  <Calendar size={11} />
                  Profissional
                </p>
                <p className="text-sm font-semibold text-zinc-900">{resource.dentist.name}</p>
                {resource.dentist.specialty && (
                  <p className="text-xs text-zinc-400">{resource.dentist.specialty}</p>
                )}
              </div>
            </>
          )}

          <div className="h-px bg-zinc-100" />

          {/* Horário */}
          <div className="space-y-1">
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
              <Clock size={11} />
              Horário
            </p>
            <p className="text-sm font-semibold text-zinc-900">
              {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
            </p>
            <p className="text-xs text-zinc-400 capitalize">
              {format(start, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>

          {/* Observações */}
          {resource.notes && (
            <>
              <div className="h-px bg-zinc-100" />
              <div className="space-y-1">
                <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium flex items-center gap-1.5">
                  <FileText size={11} />
                  Observações
                </p>
                <p className="text-sm text-zinc-600 leading-relaxed">{resource.notes}</p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {resource.patient?.id && (
          <div className="px-6 py-4 border-t border-zinc-100">
            <a
              href={`/patients/${resource.patient.id}`}
              className="block w-full text-center text-sm font-medium text-[#730021] hover:text-[#8a0027] py-2 px-4 rounded-lg border border-[#730021]/20 hover:bg-[#730021]/5 transition"
            >
              Ver ficha do paciente
            </a>
          </div>
        )}
      </div>
    </>
  )
}