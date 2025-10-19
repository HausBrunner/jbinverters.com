import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user - use environment variable for seeding only
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'We The People JB !'
  const hashedPassword = await bcrypt.hash(seedPassword, 10)
  
  const admin = await prisma.admin.upsert({
    where: { email: 'jbinverters@gmail.com' },
    update: {},
    create: {
      email: 'jbinverters@gmail.com',
      password: hashedPassword,
    },
  })

  // Create sample products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'product-1' },
      update: {},
      create: {
        id: 'product-1',
        name: 'Pure Sine Wave Inverter 1000W',
        description: 'High-quality pure sine wave inverter perfect for sensitive electronics. Features overload protection and cooling fan.',
        price: 299.99,
        stock: 10,
        imageUrl: '/images/inverter-3000w.svg',
        displayOrder: 1,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-2' },
      update: {},
      create: {
        id: 'product-2',
        name: 'Modified Sine Wave Inverter 2000W',
        description: 'Reliable modified sine wave inverter for general purpose applications. Built-in LCD display and USB ports.',
        price: 449.99,
        stock: 8,
        imageUrl: '/images/inverter-2000w.svg',
        displayOrder: 2,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-3' },
      update: {},
      create: {
        id: 'product-3',
        name: 'Pure Sine Wave Inverter 3000W',
        description: 'Heavy-duty pure sine wave inverter with remote control. Ideal for RVs, boats, and off-grid applications.',
        price: 699.99,
        stock: 5,
        imageUrl: '/images/inverter-3000w.svg',
        displayOrder: 3,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-4' },
      update: {},
      create: {
        id: 'product-4',
        name: 'Battery Charger 40A',
        description: 'Smart battery charger with multiple charging modes. Compatible with AGM, gel, and flooded batteries.',
        price: 199.99,
        stock: 12,
        imageUrl: '/images/charger-40a.svg',
        displayOrder: 4,
      },
    }),
    prisma.product.upsert({
      where: { id: 'product-5' },
      update: {},
      create: {
        id: 'product-5',
        name: 'Solar Charge Controller 60A MPPT',
        description: 'Maximum Power Point Tracking solar charge controller with Bluetooth monitoring and LCD display.',
        price: 329.99,
        stock: 7,
        imageUrl: '/images/solar-controller-60a.svg',
        displayOrder: 5,
      },
    }),
    prisma.product.upsert({
      where: { id: 'mail-in-service' },
      update: {},
      create: {
        id: 'mail-in-service',
        name: 'Mail-In Repair Service',
        description: 'Professional repair service for your inverter or power equipment. Includes diagnosis and repair estimate.',
        price: 89.99,
        stock: 999,
        imageUrl: '/images/mail-in-service.svg',
        displayOrder: 6,
      },
    }),
  ])

  console.log('Database seeded successfully!')
  console.log('Admin created:', admin.email)
  console.log('Products created:', products.length)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
