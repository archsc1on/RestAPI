// scripts/create-admin.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const hashed = await bcrypt.hash('dZaki246', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'sakun4736@gmail.com' },
    update: {},
    create: {
      email: 'sakun4736@gmail.com',
      name: 'Dzaki',
      password: hashed,
      role: 'ADMIN'
    }
  })
  
  // Create token for admin
  await prisma.token.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      balance: 9999
    }
  })
  
  console.log('✅ Admin created:', user.email)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())