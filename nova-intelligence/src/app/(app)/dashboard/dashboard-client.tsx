// src/app/(app)/dashboard/dashboard-client.tsx
'use client'

import OwnerProfilePage from './profile-owner'
import DentistProfilePage from './profile-dentist'
import ReceptionistProfilePage from './profile-receptionist'
import ManagerProfilePage from './profile-manager'

interface Props {
  role: string
  name: string
}

export default function DashboardClient({ role, name }: Props) {
  if (role === 'DENTIST') return <DentistProfilePage name={name} />
  if (role === 'RECEPTIONIST') return <ReceptionistProfilePage name={name} />
  if (role === 'MANAGER') return <ManagerProfilePage name={name} />
  return <OwnerProfilePage name={name} />
}