'use client'

import { Bell, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TopbarProps {
  title?: string
  subtitle?: string
}

export function Topbar({ title, subtitle }: TopbarProps) {
  return (
    <header className="h-16 border-b border-zinc-100 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        {title && <h1 className="text-base font-semibold text-zinc-900">{title}</h1>}
        {subtitle && <p className="text-xs text-zinc-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <Search className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-indigo-600 rounded-full" />
        </Button>
      </div>
    </header>
  )
}
