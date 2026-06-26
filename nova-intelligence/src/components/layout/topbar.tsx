'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Search, CheckCheck, CalendarCheck, UserCheck, XCircle, AlertCircle } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CLINIC_ID = 'cmqekbx1q0000tulgf1oypfjw'

interface TopbarProps {
  title?: string
  subtitle?: string
}

const NOTIF_ICON: Record<string, any> = {
  PATIENT_ARRIVED:       UserCheck,
  APPOINTMENT_BOOKED:    CalendarCheck,
  APPOINTMENT_COMPLETED: CheckCheck,
  APPOINTMENT_CANCELLED: XCircle,
  NO_SHOW:               AlertCircle,
}

const NOTIF_COLOR: Record<string, string> = {
  PATIENT_ARRIVED:       'text-green-600 bg-green-50',
  APPOINTMENT_BOOKED:    'text-blue-600 bg-blue-50',
  APPOINTMENT_COMPLETED: 'text-zinc-500 bg-zinc-100',
  APPOINTMENT_CANCELLED: 'text-red-500 bg-red-50',
  NO_SHOW:               'text-orange-500 bg-orange-50',
}

export function Topbar({ title, subtitle }: TopbarProps) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  async function fetchNotifications() {
    try {
      const res = await fetch(`/api/notifications?clinicId=${CLINIC_ID}`)
      const data = await res.json()
      setNotifications(data.notifications ?? [])
      setUnreadCount(data.unreadCount ?? 0)
    } catch {}
  }

  async function markAllRead() {
    await fetch(`/api/notifications?clinicId=${CLINIC_ID}`, { method: 'PATCH' })
    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  // Polling a cada 10s
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 10000)
    return () => clearInterval(interval)
  }, [])

  // Fechar ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleOpen() {
    setOpen(o => !o)
    if (!open && unreadCount > 0) markAllRead()
  }

  return (
    <header
      className="h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm"
      style={{
        background: 'rgba(248, 247, 245, 0.85)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div>
        {title && (
          <h1 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '1px' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-1" ref={dropdownRef}>
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Sino */}
        <div className="relative">
          <button
            onClick={handleOpen}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-soft)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full bg-[#730021] text-white text-[9px] font-bold leading-none">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden">
              {/* Header dropdown */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
                <p className="text-sm font-semibold text-zinc-900">Notificações</p>
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-zinc-400 hover:text-zinc-600 transition flex items-center gap-1"
                  >
                    <CheckCheck size={12} />
                    Marcar todas como lidas
                  </button>
                )}
              </div>

              {/* Lista */}
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="w-6 h-6 text-zinc-200 mx-auto mb-2" />
                    <p className="text-sm text-zinc-400">Nenhuma notificação</p>
                  </div>
                ) : (
                  notifications.map(n => {
                    const Icon = NOTIF_ICON[n.type] ?? Bell
                    const color = NOTIF_COLOR[n.type] ?? 'text-zinc-500 bg-zinc-100'
                    return (
                      <div
                        key={n.id}
                        className={`flex gap-3 px-4 py-3 border-b border-zinc-50 transition-colors ${
                          !n.read ? 'bg-[#730021]/3' : 'hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                          <Icon size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium text-zinc-900 leading-tight">{n.title}</p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#730021] shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-snug">{n.body}</p>
                          <p className="text-[10px] text-zinc-300 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-zinc-100">
                  <p className="text-xs text-zinc-300 text-center">
                    Últimas {notifications.length} notificações
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}