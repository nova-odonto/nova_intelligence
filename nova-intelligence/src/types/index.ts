export type Role = 'OWNER' | 'MANAGER' | 'DENTIST' | 'RECEPTIONIST'
export type OpportunityStatus = 'ACTIVE' | 'WON' | 'LOST' | 'RECOVERED'
export type InteractionType = 'WHATSAPP' | 'PHONE' | 'VISIT' | 'EMAIL'

export interface DashboardMetrics {
  recoveredRevenue: number
  revenueAtRisk: number
  recoverablePatients: number
  lostRevenue: number
  totalOpportunities: number
  conversionRate: number
  topLeadSource: {
    name: string
    value: number
    count: number
  }
  monthlyData: Array<{
    month: string
    recovered: number
    lost: number
    potential: number
  }>
  statusBreakdown: Array<{
    status: string
    count: number
    value: number
  }>
}

export interface BriefingData {
  ownerName: string
  recoveredRevenue: number
  revenueAtRisk: number
  revenuePotential: number
  featuredChannel: string
  featuredChannelValue: number
  insights: string[]
  topOpportunities: Array<{
    id: string
    patientName: string
    treatment: string
    value: number
    status: OpportunityStatus
    lastContact: string | null
  }>
}
