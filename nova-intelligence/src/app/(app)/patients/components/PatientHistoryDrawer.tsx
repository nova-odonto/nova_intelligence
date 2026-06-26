'use client'

import { X, Calendar, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils'

interface PatientHistoryDrawerProps {
  patient: any
  onClose: () => void
}

const APPOINTMENT_STATUS: Record<string, { label: string; color: string }> = {
  SCHEDULED:  { label: 'Agendado',        color: 'text-blue-600 bg-blue-50' },
  CONFIRMED:  { label: 'Confirmado',       color: 'text-green-600 bg-green-50' },
  COMPLETED:  { label: 'Concluído',        color: 'text-zinc-600 bg-zinc-100' },
  CANCELLED:  { label: 'Cancelado',        color: 'text-red-600 bg-red-50' },
  NO_SHOW:    { label: 'Não compareceu',   color: 'text-orange-600 bg-orange-50' },
}

export function PatientHistoryDrawer({ patient, onClose }: PatientHistoryDrawerProps) {
  const phone = patient.phone?.replace(/\D/g, '')
  const waLink = phone ? `https://wa.me/55${phone}` : null

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-[420px] bg-white border-l border-zinc-200 shadow-xl z-50 flex flex-col">

        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">{patient.name}</h2>
              <p className="text-sm text-zinc-400 mt-0.5">{patient.phone ?? 'Sem telefone'}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400 transition">
              <X size={16} />
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="bg-zinc-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-semibold text-zinc-900">{patient.appointmentCount ?? 0}</p>
              <p className="text-[11px] text-zinc-400">Consultas</p>
            </div>
            <div className="bg-zinc-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-semibold text-zinc-900">{patient.interactionCount ?? 0}</p>
              <p className="text-[11px] text-zinc-400">Interações</p>
            </div>
            <div className="bg-zinc-50 rounded-lg px-3 py-2 text-center">
              <p className="text-lg font-semibold text-zinc-900">
                {patient.latestValue ? formatCurrency(patient.latestValue) : '—'}
              </p>
              <p className="text-[11px] text-zinc-400">Valor est.</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Última oportunidade */}
          {patient.latestTreatment && (
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium mb-2">Tratamento em andamento</p>
              <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                <p className="text-sm font-medium text-zinc-800">{patient.latestTreatment}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  patient.latestOppStatus === 'WON' ? 'bg-green-50 text-green-700' :
                  patient.latestOppStatus === 'LOST' ? 'bg-red-50 text-red-700' :
                  patient.latestOppStatus === 'RECOVERED' ? 'bg-purple-50 text-purple-700' :
                  'bg-blue-50 text-blue-700'
                }`}>
                  {patient.latestOppStatus === 'WON' ? 'Ganho' :
                   patient.latestOppStatus === 'LOST' ? 'Perdido' :
                   patient.latestOppStatus === 'RECOVERED' ? 'Recuperado' : 'Em andamento'}
                </span>
              </div>
            </div>
          )}

          {/* Agendamentos recentes */}
          <div>
            <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium mb-3 flex items-center gap-1.5">
              <Calendar size={11} />
              Histórico de consultas
            </p>
            {patient.appointments?.length > 0 ? (
              <div className="space-y-2">
                {patient.appointments.map((apt: any) => {
                  const st = APPOINTMENT_STATUS[apt.status] ?? { label: apt.status, color: 'text-zinc-600 bg-zinc-100' }
                  return (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:bg-zinc-50 transition">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-800 capitalize">{apt.type}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                          {format(new Date(apt.startAt), "d MMM yyyy 'às' HH:mm", { locale: ptBR })}
                          {apt.dentist?.name && ` · ${apt.dentist.name}`}
                        </p>
                        {apt.notes && (
                          <p className="text-xs text-zinc-400 mt-1 truncate">{apt.notes}</p>
                        )}
                      </div>
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${st.color}`}>
                        {st.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-zinc-400 py-3 text-center">Nenhuma consulta registrada</p>
            )}
          </div>

          {/* Info adicional */}
          {(patient.email || patient.birthDate || patient.leadSource) && (
            <div>
              <p className="text-[11px] text-zinc-400 uppercase tracking-wide font-medium mb-3">Dados do paciente</p>
              <div className="space-y-2 text-sm">
                {patient.email && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">E-mail</span>
                    <span className="text-zinc-700">{patient.email}</span>
                  </div>
                )}
                {patient.birthDate && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Nascimento</span>
                    <span className="text-zinc-700">{format(new Date(patient.birthDate), 'dd/MM/yyyy')}</span>
                  </div>
                )}
                {patient.leadSource && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Canal</span>
                    <span className="text-zinc-700">{patient.leadSource}</span>
                  </div>
                )}
                {patient.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Cadastrado em</span>
                    <span className="text-zinc-700">{format(new Date(patient.createdAt), 'dd/MM/yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex gap-2">
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-[#25D366] hover:bg-[#1fba59] text-white text-sm font-medium transition"
            >
              <MessageSquare size={14} />
              Abrir WhatsApp
            </a>
          )}
          <a
            href={`/patients/${patient.id}`}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg border border-[#730021]/20 text-[#730021] hover:bg-[#730021]/5 text-sm font-medium transition"
          >
            Ver ficha completa
          </a>
        </div>
      </div>
    </>
  )
}