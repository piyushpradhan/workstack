import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seeding...')

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@workstack.com' },
      update: {},
      create: {
        email: 'admin@workstack.com',
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
        password: 'admin123'
      }
    }),
    prisma.user.upsert({
      where: { email: 'user@workstack.com' },
      update: {},
      create: {
        email: 'user@workstack.com',
        name: 'Regular User',
        role: 'MEMBER',
        isActive: true,
        password: 'user123'
      }
    })
  ])

  console.log('Created users:', users)
  console.log('Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect().then(() => {
      console.log("Disconnected from Prisma");
    }).catch((err) => console.error("Error disconnecting from Prisma: ", err));
  })
