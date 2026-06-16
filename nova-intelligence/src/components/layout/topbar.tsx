'use client'

import { Bell, Search } from 'lucide-react'

interface TopbarProps {
  title?: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
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

      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Search className="w-4 h-4" />
        </button>

        <button
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors relative"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-soft)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <Bell className="w-4 h-4" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--primary)' }}
          />
        </button>
      </div>
    </header>
  )
}