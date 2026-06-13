// Service será conectado ao banco após `prisma migrate dev`
// Por ora, retorna dados mockados para o build funcionar

export async function getBriefingData(_clinicId: string) {
  return {
    ownerName: 'Dra. Tamires Freire',
    recoveredRevenue: 28400,
    revenueAtRisk: 67200,
    revenuePotential: 142500,
    featuredChannel: 'MedPrev',
    featuredChannelValue: 34200,
    insights: [
      '12 oportunidades ativas sem contato há mais de 90 dias.',
      'MedPrev é o canal com maior receita gerada — priorize esse canal.',
      'Taxa de conversão atual: 28.4%. Meta recomendada: 35%.',
      '7 oportunidades perdidas nos últimos 12 meses — revise o processo de follow-up.',
    ],
    topOpportunities: [
      { id: '1', patientName: 'Marcos Oliveira', treatment: 'Prótese Protocolo', value: 12000, status: 'ACTIVE' as const, lastContact: '15 dias atrás' },
      { id: '2', patientName: 'Ana Santos', treatment: 'Implante Dentário', value: 3500, status: 'ACTIVE' as const, lastContact: '3 dias atrás' },
      { id: '3', patientName: 'Carlos Lima', treatment: 'Facetas de Porcelana', value: 7200, status: 'ACTIVE' as const, lastContact: 'Nunca' },
      { id: '4', patientName: 'Juliana Costa', treatment: 'Ortodontia', value: 4800, status: 'ACTIVE' as const, lastContact: '45 dias atrás' },
      { id: '5', patientName: 'Ricardo Alves', treatment: 'Invisalign', value: 8500, status: 'ACTIVE' as const, lastContact: '7 dias atrás' },
    ],
  }
}
