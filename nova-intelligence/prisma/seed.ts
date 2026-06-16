import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const firstNames = ['Ana','Carlos','Maria','João','Fernanda','Paulo','Juliana','Ricardo','Beatriz','Marcos','Camila','Lucas','Patricia','Rafael','Isabela','Diego','Larissa','Thiago','Mariana','Bruno','Amanda','Felipe','Natalia','Rodrigo','Daniela','Eduardo','Vanessa','Leonardo','Gabriela','Anderson']
const lastNames = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Alves','Pereira','Lima','Gomes','Costa','Ribeiro','Martins','Carvalho','Almeida','Lopes','Sousa','Fernandes','Vieira','Barbosa']
const treatments = ['Implante Dentário','Prótese Total','Prótese Parcial','Clareamento Dental','Ortodontia','Restauração','Extração de Siso','Canal Radicular','Prótese Protocolo','Facetas de Porcelana','Invisalign','Coroa Cerâmica','Bruxismo - Placa','Gengivoplastia']
const treatmentValues: Record<string, number> = {
  'Implante Dentário': 3500, 'Prótese Total': 4200, 'Prótese Parcial': 2800,
  'Clareamento Dental': 800, 'Ortodontia': 4800, 'Restauração': 350,
  'Extração de Siso': 600, 'Canal Radicular': 1200, 'Prótese Protocolo': 12000,
  'Facetas de Porcelana': 7200, 'Invisalign': 8500, 'Coroa Cerâmica': 1800,
  'Bruxismo - Placa': 650, 'Gengivoplastia': 1500,
}

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function randomDate(start: Date, end: Date): Date { return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())) }
function generatePhone(): string {
  const ddd = ['63','61','62','65','66']
  return `(${randomItem(ddd)}) 9${Math.floor(Math.random()*9000+1000)}-${Math.floor(Math.random()*9000+1000)}`
}

async function main() {
  console.log('🌱 Iniciando seed...')

  await prisma.appointment.deleteMany()
  await prisma.workSchedule.deleteMany()
  await prisma.dentist.deleteMany()
  await prisma.interaction.deleteMany()
  await prisma.opportunity.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.leadSource.deleteMany()
  await prisma.user.deleteMany()
  await prisma.clinic.deleteMany()

  const clinic = await prisma.clinic.create({
    data: {
      name: 'Nova Odontologia',
      phone: '(63) 3215-8900',
      email: 'contato@novaodontologia.com.br',
      address: 'Av. Teotônio Segurado, 1234, Taquaralto, Palmas - TO',
    },
  })

  const owner = await prisma.user.create({
    data: {
      name: 'Dra. Tamires Freire',
      email: 'tamires@novaodontologia.com.br',
      password: 'hashed_admin123',
      role: 'OWNER',
      clinicId: clinic.id,
    },
  })

  await prisma.user.create({
    data: { name: 'Carla Menezes', email: 'carla@novaodontologia.com.br', password: 'hashed_admin123', role: 'MANAGER', clinicId: clinic.id },
  })

  const receptionist = await prisma.user.create({
    data: { name: 'Fernanda Lima', email: 'fernanda@novaodontologia.com.br', password: 'hashed_admin123', role: 'RECEPTIONIST', clinicId: clinic.id },
  })

  // ── DENTISTAS ──
  const dentistaTamires = await prisma.dentist.create({
    data: { name: 'Dra. Tamires Freire', specialty: 'Implantodontia', clinicId: clinic.id }
  })

  const dentistaCarlos = await prisma.dentist.create({
    data: { name: 'Dr. Carlos Mendes', specialty: 'Ortodontia', clinicId: clinic.id }
  })

  console.log('✅ Dentistas criados')

  // ── HORÁRIOS DE TRABALHO (Seg-Sex 08:00-18:00, slots 30min) ──
  const diasUteis = [1, 2, 3, 4, 5] // Seg a Sex

  for (const dentist of [dentistaTamires, dentistaCarlos]) {
    for (const day of diasUteis) {
      await prisma.workSchedule.create({
        data: {
          dentistId: dentist.id,
          dayOfWeek: day,
          startTime: '08:00',
          endTime: '18:00',
          slotMinutes: 30,
        }
      })
    }
  }

  // Dra. Tamires também atende sábado 08:00-12:00
  await prisma.workSchedule.create({
    data: {
      dentistId: dentistaTamires.id,
      dayOfWeek: 6,
      startTime: '08:00',
      endTime: '12:00',
      slotMinutes: 30,
    }
  })

  console.log('✅ Horários de trabalho criados')

  // ── LEAD SOURCES ──
  const sourceNames = ['MedPrev','Instagram','Google','Indicação','Site']
  const leadSources = await Promise.all(
    sourceNames.map((name) => prisma.leadSource.create({
      data: { name, description: `Origem: ${name}`, clinicId: clinic.id }
    }))
  )

  // ── PACIENTES ──
  const now = new Date()
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
  const patients = []

  for (let i = 0; i < 100; i++) {
    const firstName = randomItem(firstNames)
    const lastName = randomItem(lastNames)
    let sourceId: string
    if (i < 35) sourceId = leadSources[0].id
    else if (i < 50) sourceId = leadSources[1].id
    else sourceId = randomItem(leadSources).id

    const patient = await prisma.patient.create({
      data: {
        name: `${firstName} ${lastName}`,
        phone: generatePhone(),
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@email.com`,
        clinicId: clinic.id,
        leadSourceId: sourceId,
        lastVisitAt: Math.random() > 0.3 ? randomDate(oneYearAgo, now) : null,
        createdAt: randomDate(oneYearAgo, now),
      },
    })
    patients.push(patient)
  }

  console.log(`✅ Pacientes: ${patients.length}`)

  // ── AGENDAMENTOS DE EXEMPLO ──
  const hoje = new Date()
  const agendamentos = [
    { dentist: dentistaTamires, patient: patients[0], hora: '09:00', tipo: 'consulta' },
    { dentist: dentistaTamires, patient: patients[1], hora: '10:00', tipo: 'retorno' },
    { dentist: dentistaCarlos, patient: patients[2], hora: '09:30', tipo: 'ortodontia' },
    { dentist: dentistaCarlos, patient: patients[3], hora: '14:00', tipo: 'consulta' },
  ]

  for (const a of agendamentos) {
    const startAt = new Date(hoje)
    const [h, m] = a.hora.split(':').map(Number)
    startAt.setHours(h, m, 0, 0)
    const endAt = new Date(startAt)
    endAt.setMinutes(endAt.getMinutes() + 30)

    await prisma.appointment.create({
      data: {
        clinicId: clinic.id,
        patientId: a.patient.id,
        dentistId: a.dentist.id,
        startAt,
        endAt,
        type: a.tipo,
        status: 'SCHEDULED',
      }
    })
  }

  console.log('✅ Agendamentos de exemplo criados')

  // ── OPORTUNIDADES ──
  const statuses = ['ACTIVE','ACTIVE','ACTIVE','WON','WON','LOST','RECOVERED']
  const opportunities = []

  for (let i = 0; i < 50; i++) {
    const patient = randomItem(patients)
    const treatment = randomItem(treatments)
    const baseValue = treatmentValues[treatment]
    const estimatedValue = Math.round(baseValue + (Math.random() * baseValue * 0.2 - baseValue * 0.1))
    const status = randomItem(statuses)
    const createdAt = randomDate(oneYearAgo, now)

    const opp = await prisma.opportunity.create({
      data: {
        treatmentName: treatment,
        estimatedValue,
        status: status as any,
        patientId: patient.id,
        leadSourceId: patient.leadSourceId,
        clinicId: clinic.id,
        lastContactAt: status !== 'LOST' ? randomDate(createdAt, now) : null,
        wonAt: status === 'WON' ? randomDate(createdAt, now) : null,
        lostAt: status === 'LOST' ? randomDate(createdAt, now) : null,
        recoveredAt: status === 'RECOVERED' ? randomDate(createdAt, now) : null,
        createdAt,
      },
    })
    opportunities.push(opp)
  }

  console.log(`✅ Oportunidades: ${opportunities.length}`)

  // ── INTERAÇÕES ──
  const interactionTypes = ['WHATSAPP','WHATSAPP','PHONE','VISIT','EMAIL']
  const interactionNotes = ['Enviou mensagem sobre orçamento','Confirmou consulta','Cancelou, vai remarcar','Compareceu para avaliação','Tirou dúvidas sobre o procedimento','Solicitou novo agendamento','Enviou documentos solicitados']

  for (let i = 0; i < 200; i++) {
    const patient = randomItem(patients)
    const type = randomItem(interactionTypes)
    const opportunity = Math.random() > 0.5 ? randomItem(opportunities) : null

    await prisma.interaction.create({
      data: {
        type: type as any,
        notes: randomItem(interactionNotes),
        patientId: patient.id,
        opportunityId: opportunity?.id ?? null,
        userId: Math.random() > 0.5 ? owner.id : receptionist.id,
        createdAt: randomDate(oneYearAgo, now),
      },
    })
  }

  console.log('✅ Interações: 200')
  console.log('\n🎉 Seed concluído!')
  console.log('Login: tamires@novaodontologia.com.br / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())