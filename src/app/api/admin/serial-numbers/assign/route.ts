import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST /api/admin/serial-numbers/assign - Assign serial numbers to an order
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { orderId, serialNumberIds } = await request.json()

    if (!orderId || !serialNumberIds || !Array.isArray(serialNumberIds)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Update serial numbers to link them to the order and mark as SOLD
    const updatedSerialNumbers = await Promise.all(
      serialNumberIds.map((serialId: string) =>
        prisma.serialNumber.update({
          where: { id: serialId },
          data: {
            orderId,
            status: 'SOLD'
          }
        })
      )
    )

    return NextResponse.json(updatedSerialNumbers)
  } catch (error) {
    console.error('Error assigning serial numbers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
