'use client'

import { useEffect, useState, useRef } from 'react'
import { UserCheck, CalendarCheck, CheckCheck, XCircle, AlertCircle, X } from 'lucide-react'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

const NOTIF_ICON: Record<string, any> = {
  PATIENT_ARRIVED:       UserCheck,
  APPOINTMENT_BOOKED:    CalendarCheck,
  APPOINTMENT_COMPLETED: CheckCheck,
  APPOINTMENT_CANCELLED: XCircle,
  NO_SHOW:               AlertCircle,
}

const NOTIF_COLOR: Record<string, { bg: string; icon: string; border: string }> = {
  PATIENT_ARRIVED:       { bg: 'bg-green-50',  icon: 'text-green-600',  border: 'border-green-200' },
  APPOINTMENT_BOOKED:    { bg: 'bg-blue-50',   icon: 'text-blue-600',   border: 'border-blue-200'  },
  APPOINTMENT_COMPLETED: { bg: 'bg-zinc-50',   icon: 'text-zinc-500',   border: 'border-zinc-200'  },
  APPOINTMENT_CANCELLED: { bg: 'bg-red-50',    icon: 'text-red-500',    border: 'border-red-200'   },
  NO_SHOW:               { bg: 'bg-orange-50', icon: 'text-orange-500', border: 'border-orange-200'},
}

interface Toast {
  id: string
  type: string
  title: string
  body: string
}

function fireSystemNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return

  const send = () => {
    new Notification(title, {
      body,
      icon: '/icon-192.png',
    })
  }

  if (Notification.permission === 'granted') {
    send()
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') send()
    })
  }
}

export function NotificationToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const lastSeenIdRef = useRef<string | null>(null)
  const initializedRef = useRef(false)

  function dismiss(id: string) {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Solicita permissão ao montar
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission()
      }
    }
  }, [])

  useEffect(() => {
    async function poll() {
      try {
        const res = await fetch(`/api/notifications?clinicId=${CLINIC_ID}`)
        const data = await res.json()
        const notifications: any[] = data.notifications ?? []

        if (notifications.length === 0) return

        const latest = notifications[0]

        // Primeira chamada: só registra o id mais recente, sem disparar toast
        if (!initializedRef.current) {
          lastSeenIdRef.current = latest.id
          initializedRef.current = true
          return
        }

        // Notificações mais recentes que o último id visto
        const lastIndex = notifications.findIndex(n => n.id === lastSeenIdRef.current)
        const newOnes = lastIndex === -1
          ? notifications.filter(n => !n.read)
          : notifications.slice(0, lastIndex).filter(n => !n.read)

        if (newOnes.length > 0) {
          lastSeenIdRef.current = latest.id

          const incoming: Toast[] = newOnes.map(n => ({
            id: n.id,
            type: n.type,
            title: n.title,
            body: n.body,
          }))

          setToasts(prev => [...incoming, ...prev].slice(0, 5))

          // Dispara notificação nativa do Windows/OS para cada uma
          incoming.forEach(t => {
            fireSystemNotification(t.title, t.body)
            setTimeout(() => dismiss(t.id), 6000)
          })
        }
      } catch {}
    }

    poll()
    const interval = setInterval(poll, 10000)
    return () => clearInterval(interval)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 items-end">
      {toasts.map(toast => {
        const Icon = NOTIF_ICON[toast.type] ?? UserCheck
        const colors = NOTIF_COLOR[toast.type] ?? NOTIF_COLOR.PATIENT_ARRIVED

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg w-80 ${colors.bg} ${colors.border}`}
            style={{ animation: 'slideIn 0.3s ease' }}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/70 ${colors.icon}`}>
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-zinc-900 leading-tight">{toast.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{toast.body}</p>
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="text-zinc-300 hover:text-zinc-500 transition shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}