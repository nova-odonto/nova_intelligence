// src/components/layout/sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  LayoutDashboard, TrendingUp, Users, Target,
  GitBranch, FileBarChart, Settings, CalendarDays,
  ChevronDown, LogOut, Menu, X, MessageCircle, Megaphone,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: string[]
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['OWNER', 'MANAGER'] },
  { href: '/revenue', label: 'Receita', icon: TrendingUp, roles: ['OWNER', 'MANAGER'] },
  { href: '/patients', label: 'Pacientes', icon: Users, roles: ['OWNER', 'MANAGER', 'DENTIST', 'RECEPTIONIST'] },
  { href: '/opportunities', label: 'Oportunidades', icon: Target, roles: ['OWNER', 'MANAGER'] },
  { href: '/campaign', label: 'Campanhas', icon: Megaphone, roles: ['OWNER', 'MANAGER'] },
  { href: '/sources', label: 'Canais', icon: GitBranch, roles: ['OWNER', 'MANAGER'] },
  { href: '/scheduling', label: 'Agenda', icon: CalendarDays, roles: ['OWNER', 'MANAGER', 'DENTIST', 'RECEPTIONIST'] },
  { href: '/whatsapp', label: 'WhatsApp', icon: MessageCircle, roles: ['OWNER', 'MANAGER', 'RECEPTIONIST'] },
  { href: '/briefing', label: 'Briefing Executivo', icon: FileBarChart, roles: ['OWNER'] },
  { href: '/settings', label: 'Configurações', icon: Settings, roles: ['OWNER', 'MANAGER'] },
]

const roleLabel: Record<string, string> = {
  OWNER: 'Proprietária',
  MANAGER: 'Gerente',
  DENTIST: 'Dentista',
  RECEPTIONIST: 'Secretária',
}

function SidebarContent({ onNavClick }: { onNavClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [menuOpen, setMenuOpen] = useState(false)

  const role = session?.user?.role ?? ''
  const name = session?.user?.name ?? ''
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((n: string) => n[0]).join('')
  const visibleItems = navItems.filter(item => item.roles.includes(role))

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-zinc-100 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-[#730021] flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 2C5.79 2 4 3.79 4 6c0 1.5.83 2.8 2.05 3.5L5.5 14h5l-.55-4.5C11.17 8.8 12 7.5 12 6c0-2.21-1.79-4-4-4z" fill="white" />
          </svg>
        </div>
        <div>
          <span className="text-sm font-semibold text-zinc-900">Nova</span>
          <span className="text-sm font-semibold text-[#730021]"> Intelligence</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-[#730021]/8 text-[#730021] font-medium'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-[#730021]' : 'text-zinc-400')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User menu */}
      <div className="border-t border-zinc-100 p-3 shrink-0">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-[#730021]/10 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-[#730021]">{initials}</span>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-medium text-zinc-900 truncate">{name}</p>
            <p className="text-[10px] text-zinc-400">{roleLabel[role] ?? role}</p>
          </div>
          <ChevronDown className={cn('w-3.5 h-3.5 text-zinc-400 transition-transform', menuOpen && 'rotate-180')} />
        </button>

        {menuOpen && (
          <div className="mt-1 bg-white border border-zinc-100 rounded-lg shadow-md overflow-hidden">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors text-sm text-zinc-600"
            >
              <LogOut className="w-3.5 h-3.5 text-zinc-400" />
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-60 border-r border-zinc-100 bg-white flex-col z-20">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-zinc-100 flex items-center justify-between px-4 z-30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#730021] flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M8 2C5.79 2 4 3.79 4 6c0 1.5.83 2.8 2.05 3.5L5.5 14h5l-.55-4.5C11.17 8.8 12 7.5 12 6c0-2.21-1.79-4-4-4z" fill="white" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-zinc-900">Nova <span className="text-[#730021]">Intelligence</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-zinc-50 transition-colors"
        >
          <Menu className="w-5 h-5 text-zinc-600" />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside className={cn(
        'md:hidden fixed top-0 left-0 h-screen w-72 bg-white z-50 flex flex-col shadow-xl transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
        <SidebarContent onNavClick={() => setMobileOpen(false)} />
      </aside>
    </>
  )
}