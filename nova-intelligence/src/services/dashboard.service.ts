// Service conectará ao banco após `prisma migrate dev`
export async function getDashboardMetrics(_clinicId: string) {
  return {
    recoveredRevenue: 28400,
    revenueAtRisk: 67200,
    recoverablePatients: 34,
    lostRevenue: 18200,
    totalOpportunities: 20,
    conversionRate: 28.4,
    topLeadSource: { name: 'MedPrev', value: 34200, count: 35 },
    monthlyData: [
      { month: 'jan', recovered: 3200, lost: 8400, potential: 12000 },
      { month: 'fev', recovered: 4100, lost: 6200, potential: 15000 },
      { month: 'mar', recovered: 5800, lost: 7100, potential: 18500 },
      { month: 'abr', recovered: 3900, lost: 9200, potential: 14200 },
      { month: 'mai', recovered: 6200, lost: 5800, potential: 21000 },
      { month: 'jun', recovered: 5200, lost: 4900, potential: 19800 },
    ],
    statusBreakdown: [
      { status: 'Ativo', count: 28, value: 67200 },
      { status: 'Ganho', count: 12, value: 31400 },
      { status: 'Recuperado', count: 8, value: 28400 },
      { status: 'Perdido', count: 7, value: 18200 },
    ],
  }
}
