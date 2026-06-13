'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Target,
  GitBranch,
  FileBarChart,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Visão Geral',
    icon: LayoutDashboard,
  },
  {
    href: '/revenue',
    label: 'Receita',
    icon: TrendingUp,
  },
  {
    href: '/patients',
    label: 'Pacientes',
    icon: Users,
  },
  {
    href: '/opportunities',
    label: 'Oportunidades',
    icon: Target,
  },
  {
    href: '/sources',
    label: 'Canais',
    icon: GitBranch,
  },
  {
    href: '/briefing',
    label: 'Briefing Executivo',
    icon: FileBarChart,
    ownerOnly: true,
  },
  {
    href: '/settings',
    label: 'Configurações',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 border-r border-zinc-100 bg-white flex flex-col z-20">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-zinc-100">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="text-sm font-semibold text-zinc-900">Nova</span>
          <span className="text-sm font-semibold text-indigo-600"> Intelligence</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-medium'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <Icon
                className={cn('w-4 h-4 shrink-0', isActive ? 'text-indigo-600' : 'text-zinc-400')}
              />
              {item.label}
              {item.ownerOnly && (
                <span className="ml-auto text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  Owner
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-zinc-100">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-[10px] font-semibold text-indigo-700">TF</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-900 truncate">Dra. Tamires Freire</p>
            <p className="text-[10px] text-zinc-400">Owner</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
