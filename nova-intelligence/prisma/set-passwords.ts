// prisma/set-passwords.ts
// Rode UMA vez: npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/set-passwords.ts

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const users = [
  { email: 'tamires@novaodontologia.com.br', password: 'NovaOdonto@2025' },
  { email: 'carla@novaodontologia.com.br',   password: 'Carla@2025' },
  { email: 'fernanda@novaodontologia.com.br', password: 'Fernanda@2025' },
]

async function main() {
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12)
    await prisma.user.update({
      where: { email: u.email },
      data: { password: hash },
    })
    console.log(`✅ Senha definida: ${u.email}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())