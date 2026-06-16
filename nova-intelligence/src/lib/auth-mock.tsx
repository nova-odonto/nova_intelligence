'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import type { Role } from '@/types'

export interface MockUser {
  id: string
  name: string
  email: string
  role: Role
  avatarInitials: string
  clinicId: string
}

const MOCK_USERS: MockUser[] = [
  {
    id: 'user-owner-1',
    name: 'Dra. Tamires Freire',
    email: 'tamires@novaodontologia.com.br',
    role: 'OWNER',
    avatarInitials: 'TF',
    clinicId: 'demo',
  },
  {
    id: 'user-dentist-1',
    name: 'Dr. Carlos Mendes',
    email: 'carlos@novaodontologia.com.br',
    role: 'DENTIST',
    avatarInitials: 'CM',
    clinicId: 'demo',
  },
  {
    id: 'user-receptionist-1',
    name: 'Fernanda Lima',
    email: 'fernanda@novaodontologia.com.br',
    role: 'RECEPTIONIST',
    avatarInitials: 'FL',
    clinicId: 'demo',
  },
]

interface AuthContextValue {
  user: MockUser
  setUser: (user: MockUser) => void
  mockUsers: MockUser[]
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser>(MOCK_USERS[0])

  return (
    <AuthContext.Provider value={{ user, setUser, mockUsers: MOCK_USERS }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export { MOCK_USERS }